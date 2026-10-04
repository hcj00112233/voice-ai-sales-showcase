import test from "node:test";
import assert from "node:assert/strict";
import { handleGeneration, liveConfigured, SYSTEM_PROMPT } from "../lib/live";
import { samples } from "../lib/samples";
import { emptyAccount } from "../lib/schema";
const env = {
  OPENAI_API_KEY: "test-only-placeholder",
  OPENAI_MODEL: "test-model",
};
const request = (value: unknown = samples[0].account) =>
  new Request("http://localhost:3000/api/generate", {
    method: "POST",
    body: JSON.stringify(value),
  });
const modelResponse = (value: unknown) =>
  Response.json({
    status: "completed",
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: JSON.stringify(value) }],
      },
    ],
  });
function fetcher(
  callback: (url: string, init: RequestInit) => Response | Promise<Response>,
): typeof fetch {
  return ((url, init) => callback(String(url), init!)) as typeof fetch;
}
test("custom accounts use the server-side API with structured output and untrusted input separation", async () => {
  const custom = { ...samples[0].account, company: "Custom learning business" };
  let called = false;
  const response = await handleGeneration(request(custom), {
    env,
    fetcher: fetcher((url, init) => {
      called = true;
      assert.equal(url, "https://api.openai.com/v1/responses");
      const body = JSON.parse(init.body as string);
      assert.equal(body.store, false);
      assert.equal(body.model, "test-model");
      assert.equal(body.text.format.type, "json_schema");
      assert.equal(body.text.format.strict, true);
      assert.equal(
        JSON.parse(body.input[0].content).untrustedAccountData.company,
        custom.company,
      );
      assert.match(body.instructions, /untrusted data/);
      assert.equal(
        (init.headers as Record<string, string>).Authorization,
        "Bearer test-only-placeholder",
      );
      return modelResponse(samples[0].output);
    }),
  });
  assert.ok(called);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).result, samples[0].output);
});
test("missing credentials and placeholder credentials return a useful unavailable response", async () => {
  assert.equal(liveConfigured({}), false);
  assert.equal(
    liveConfigured({ OPENAI_API_KEY: "replace-with-your-api-key" }),
    false,
  );
  const response = await handleGeneration(request(), { env: {} });
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /inputs are preserved/);
});
test("sparse custom account can return Research further with no invented evidence", async () => {
  const output = {
    ...samples[0].output,
    evidence: [],
    priority: "Research further",
    rationale:
      "No source evidence supplied. Research the company and its workflows first.",
  };
  const response = await handleGeneration(
    request({ ...emptyAccount, company: "Unknown business" }),
    { env, fetcher: fetcher(() => modelResponse(output)) },
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.deepEqual(data.result.evidence, []);
  assert.equal(data.result.priority, "Research further");
});
test("upstream failures, rate limits and timeouts are actionable and do not leak provider details", async () => {
  for (const status of [401, 429, 500]) {
    const response = await handleGeneration(request(), {
      env,
      fetcher: fetcher(
        () => new Response("test-only-placeholder provider detail", { status }),
      ),
    });
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.match(data.error, /inputs are preserved/);
    assert.ok(!JSON.stringify(data).includes(env.OPENAI_API_KEY));
  }
  const response = await handleGeneration(request(), {
    env,
    fetcher: fetcher(() => {
      throw new DOMException("Timeout", "TimeoutError");
    }),
  });
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /timed out/);
});
test("malformed, incomplete, refused and unsupported model output is rejected", async () => {
  const responses = [
    modelResponse({}),
    modelResponse({
      ...samples[0].output,
      evidence: [{ quote: "Never supplied", relevance: "Invented" }],
    }),
    Response.json({ status: "incomplete", output: [] }),
    Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "refusal", refusal: "Cannot comply" }],
        },
      ],
    }),
    new Response("invalid json", { status: 200 }),
  ];
  for (const upstream of responses) {
    const response = await handleGeneration(request(), {
      env,
      fetcher: fetcher(() => upstream),
    });
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /inputs are preserved/);
  }
});
test("invalid inputs and oversized payloads never call the provider", async () => {
  for (const input of [
    {},
    { ...samples[0].account, url: "file:///private" },
    { ...samples[0].account, notes: "x".repeat(35000) },
  ]) {
    const response = await handleGeneration(request(input), {
      env,
      fetcher: fetcher(() => {
        assert.fail("Provider must not be called");
      }),
    });
    assert.ok([400, 413].includes(response.status));
  }
});
test("cross-origin requests are rejected", async () => {
  const req = new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { Origin: "https://unrelated.example" },
    body: JSON.stringify(samples[0].account),
  });
  assert.equal((await handleGeneration(req, { env })).status, 403);
});
test("prompt includes injection, hallucination and output safeguards", () => {
  for (const rule of [
    /NEVER instructions/,
    /Do not browse/,
    /Never invent ElevenLabs/,
    /No numeric scores/,
    /exact verbatim quotes/,
    /80–120/,
    /Research further/,
  ])
    assert.match(SYSTEM_PROMPT, rule);
});
test("same-origin loopback request works when Next normalizes request.url", async () => {
  const req = new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { Origin: "http://127.0.0.1:3000", Host: "127.0.0.1:3000" },
    body: JSON.stringify(samples[0].account),
  });
  const response = await handleGeneration(req, {
    env,
    fetcher: fetcher(() => modelResponse(samples[0].output)),
  });
  assert.equal(response.status, 200);
});
