import test from "node:test";
import assert from "node:assert/strict";
import { samples, matchSample } from "../lib/samples";
import {
  accountSchema,
  emptyAccount,
  generationSchema,
  validateGeneration,
  wordCount,
} from "../lib/schema";
import {
  initialState,
  workflowReducer as reduce,
  preparationPackage,
  toMarkdown,
  type WorkflowState,
} from "../lib/workflow";

function generated(index = 0) {
  let state = reduce(initialState(), {
    type: "load",
    account: samples[index].account,
  });
  return reduce(state, {
    type: "generated",
    result: validateGeneration(samples[index].output, state.account),
    revision: state.revision,
  });
}
function approve(state: WorkflowState) {
  for (let index = 0; index < 3; index++)
    state = reduce(state, { type: "check", index, value: true });
  return reduce(state, { type: "approve", at: "2026-10-04T12:00:00Z" });
}
for (const [index, sample] of samples.entries()) {
  test(`${sample.account.company}: complete sample workflow and both exports`, () => {
    let state = generated(index);
    for (const stage of [2, 3, 4])
      state = reduce(state, { type: "stage", stage });
    assert.equal(state.stage, 4);
    assert.equal(
      state.result?.evidence.every((item) =>
        state.account.notes.includes(item.quote),
      ),
      true,
    );
    assert.ok(
      wordCount(state.draft.body) >= 80 && wordCount(state.draft.body) <= 120,
    );
    assert.equal(preparationPackage(state).reviewStatus, "Unreviewed draft");
    assert.match(toMarkdown(preparationPackage(state)), /Unreviewed draft/);
    state = approve(state);
    const pkg = preparationPackage(state);
    assert.equal(pkg.commercialStatus, "Discovery pending");
    assert.equal(pkg.reviewStatus, "Approved preparation package");
    assert.equal(
      JSON.parse(JSON.stringify(pkg)).outreachDraft.body,
      state.draft.body,
    );
    assert.match(toMarkdown(pkg), /Reviewed outreach draft/);
    assert.equal(pkg.proposedUseCase.questions.length, 3);
  });
}
test("every source field invalidates results and prevents exporting, even if restored", () => {
  for (const field of Object.keys(
    emptyAccount,
  ) as (keyof typeof emptyAccount)[]) {
    const base = approve(generated());
    let state = reduce(base, {
      type: "account",
      field,
      value: base.account[field] + " changed",
    });
    assert.equal(state.approvedAt, null);
    assert.ok(state.outdated);
    assert.deepEqual(state.checks, [false, false, false]);
    assert.throws(() => preparationPackage(state), /Regenerate/);
    state = reduce(state, {
      type: "account",
      field,
      value: base.account[field],
    });
    assert.ok(state.outdated);
    assert.equal(approve(state).approvedAt, null);
    state = reduce(state, {
      type: "generated",
      result: samples[0].output,
      revision: state.revision,
    });
    assert.equal(state.outdated, false);
    assert.equal(state.approvedAt, null);
  }
});
test("editing subject or body removes approval and exports current content", () => {
  for (const field of ["subject", "body"] as const) {
    let state = approve(generated());
    state = reduce(state, {
      type: "draft",
      draft: { ...state.draft, [field]: "Current edited content" },
    });
    assert.equal(state.approvedAt, null);
    assert.equal(state.checks[2], false);
    assert.equal(
      preparationPackage(state).outreachDraft[field],
      "Current edited content",
    );
    assert.match(
      toMarkdown(preparationPackage(state)),
      /Current edited content/,
    );
    assert.equal(preparationPackage(state).reviewStatus, "Unreviewed draft");
    state = approve(state);
    assert.ok(state.approvedAt);
  }
});
test("approval is gated and an unchecked item removes approval", () => {
  let state = generated();
  assert.equal(reduce(state, { type: "approve", at: "now" }).approvedAt, null);
  state = approve(state);
  assert.ok(state.approvedAt);
  state = reduce(state, { type: "check", index: 0, value: false });
  assert.equal(state.approvedAt, null);
  state = reduce(state, { type: "draft", draft: { subject: " ", body: " " } });
  assert.equal(approve(state).approvedAt, null);
});
test("sample matching rejects changed and custom accounts", () => {
  assert.ok(matchSample(samples[0].account));
  assert.equal(
    matchSample({ ...samples[0].account, company: "Custom company" }),
    undefined,
  );
  assert.equal(matchSample({ ...emptyAccount, company: "Custom" }), undefined);
});
test("reset clears all account data, edits and approval", () => {
  const state = reduce(approve(generated()), { type: "reset" });
  assert.deepEqual(state.account, emptyAccount);
  assert.equal(state.result, null);
  assert.equal(state.approvedAt, null);
  assert.equal(state.stage, 0);
});
test("generation from a stale request cannot overwrite newer inputs", () => {
  const before = generated();
  const newer = reduce(before, {
    type: "account",
    field: "notes",
    value: "New source text",
  });
  const after = reduce(newer, {
    type: "generated",
    result: samples[1].output,
    revision: before.revision,
  });
  assert.deepEqual(after, newer);
});
test("changing output mode invalidates approval and results", () => {
  const state = reduce(approve(generated()), { type: "mode", mode: "live" });
  assert.ok(state.outdated);
  assert.equal(state.approvedAt, null);
});
test("validation rejects missing fields, unsupported evidence and invalid draft length", () => {
  assert.equal(
    generationSchema.safeParse({ priority: "Explore" }).success,
    false,
  );
  assert.throws(
    () =>
      validateGeneration(
        {
          ...samples[0].output,
          evidence: [{ quote: "Made up evidence", relevance: "Unsupported" }],
        },
        samples[0].account,
      ),
    /evidence/,
  );
  assert.throws(
    () =>
      validateGeneration(
        {
          ...samples[0].output,
          outreach: { subject: "Test", body: "Too short" },
        },
        samples[0].account,
      ),
    /80–120/,
  );
  assert.throws(
    () =>
      validateGeneration(
        { ...samples[0].output, evidence: [] },
        samples[0].account,
      ),
    /priority/,
  );
});
test("missing fields can stay unknown; invalid URLs are rejected", () => {
  assert.ok(
    accountSchema.safeParse({ ...emptyAccount, company: "A company" }).success,
  );
  assert.equal(
    accountSchema.safeParse({
      ...samples[0].account,
      url: "javascript:alert(1)",
    }).success,
    false,
  );
  assert.equal(samples[2].output.priority, "Research further");
  assert.ok(
    samples.every((sample) =>
      sample.output.unknowns.some((item) => /Budget/.test(item)),
    ),
  );
});
test("Markdown escapes account content rather than creating headings or active links", () => {
  const state = generated();
  state.generatedAccount = {
    ...state.generatedAccount!,
    company: "# Fake approval [link](https://example.com)",
  };
  const output = toMarkdown(preparationPackage(state));
  assert.ok(output.includes("\\# Fake approval \\[link\\]"));
});
