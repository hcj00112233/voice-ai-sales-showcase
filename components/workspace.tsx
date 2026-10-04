"use client";

import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Waveform,
  Buildings,
  MagnifyingGlass,
  ChatsCircle,
  EnvelopeSimple,
  ClipboardText,
  Check,
  CheckCircle,
  Circle,
  Copy,
  DownloadSimple,
  ArrowCounterClockwise,
  X,
  Info,
  ShieldCheck,
  Flask,
  GlobeHemisphereEast,
  BookOpen,
  WarningCircle,
  PencilSimple,
  LockSimple,
  GitBranch,
} from "@phosphor-icons/react";
import {
  accountSchema,
  validateGeneration,
  wordCount,
  type Account,
  type Draft,
  type Mode,
} from "@/lib/schema";
import PreparationContext from "./preparation-context";
import Link from "next/link";
import WorkflowMap from "./workflow-map";
import { matchSample, samples } from "@/lib/samples";
import { sitePath } from "@/lib/site";
import {
  initialState,
  preparationPackage,
  toMarkdown,
  workflowReducer,
} from "@/lib/workflow";

const stages = [
  { title: "Account Brief", sub: "Start with what you know", icon: Buildings },
  {
    title: "Fit & Evidence",
    sub: "Find a reason to explore",
    icon: MagnifyingGlass,
  },
  {
    title: "Voice AI Use Case",
    sub: "Build a useful hypothesis",
    icon: ChatsCircle,
  },
  {
    title: "Outreach Draft",
    sub: "Make it worth a reply",
    icon: EnvelopeSimple,
  },
  {
    title: "Review & AE Handoff",
    sub: "Put human judgment first",
    icon: ClipboardText,
  },
];
const descriptions = [
  "A good conversation starts with a little context.",
  "Separate what you know from what needs discovery.",
  "One focused idea. A few better questions.",
  "A starting point for a conversation, in your own words.",
  "Review the preparation. Keep qualification for discovery.",
];
const checks = [
  "Evidence checked",
  "Use-case hypothesis reviewed",
  "Outreach draft reviewed",
];

function Label({
  children,
  kind = "neutral",
}: {
  children: ReactNode;
  kind?: "neutral" | "evidence" | "hypothesis" | "unknown";
}) {
  return (
    <span className={`label label-${kind}`}>
      {kind === "evidence" ? (
        <CheckCircle size={12} />
      ) : kind === "hypothesis" ? (
        <Flask size={12} />
      ) : kind === "unknown" ? (
        <Circle size={10} />
      ) : null}
      {children}
    </span>
  );
}
function NotesList({ items }: { items: string[] }) {
  return (
    <ul className="notes-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function Workspace({ initialSampleId }: { initialSampleId?: string }) {
  const [state, dispatch] = useReducer(
    workflowReducer,
    initialSampleId,
    (id) => {
      const selected = samples.find((item) => item.id === id);
      return selected
        ? workflowReducer(initialState(), { type: "load", account: selected.account })
        : initialState();
    },
  );
  const [configured, setConfigured] = useState<boolean | null>(null);
  const staticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "1";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusError, setStatusError] = useState(false);
  const mapDialog = useRef<HTMLDialogElement>(null);
  const sampleDialog = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const priorStage = useRef(0);
  const requestId = useRef(0);
  const { account, mode, stage, result, draft, outdated, approvedAt } = state;
  const sample = matchSample(account);
  const bodyWords = wordCount(draft.body);
  const pkg = result && !outdated ? preparationPackage(state) : null;
  const canApprove =
    !!result &&
    !outdated &&
    state.checks.every(Boolean) &&
    !!draft.subject.trim() &&
    !!draft.body.trim();

  async function checkConnection() {
    if (staticDemo) return;
    setConfigured(null);
    setStatusError(false);
    try {
      const response = await fetch("/api/generate", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (typeof data.configured !== "boolean") throw new Error();
      setConfigured(data.configured);
    } catch {
      setConfigured(false);
      setStatusError(true);
    }
  }
  useEffect(() => {
    if (!staticDemo) void checkConnection();
  }, [staticDemo]);
  useEffect(() => {
    if (priorStage.current !== stage) {
      titleRef.current?.focus();
      priorStage.current = stage;
    }
  }, [stage]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  function editAccount(field: keyof Account, value: string) {
    dispatch({ type: "account", field, value });
    setError("");
  }
  function selectMode(next: Mode) {
    if (next !== mode) {
      dispatch({ type: "mode", mode: next });
      setError("");
    }
  }
  function navigate(next: number) {
    dispatch({ type: "stage", stage: next });
    setError("");
  }
  function editDraft(next: Draft) {
    if (approvedAt)
      setNotice(
        "Approval removed. Review the updated outreach before approving again.",
      );
    dispatch({ type: "draft", draft: next });
  }
  async function generate() {
    setError("");
    const parsed = accountSchema.safeParse(account);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (mode === "sample") {
      if (!sample) {
        setError(
          staticDemo
            ? "Sample outputs are available only for the three unchanged fictional accounts. Load one of the sample accounts to continue."
            : "Sample outputs are available only for the three unchanged fictional accounts. Load a sample, or use Live AI mode for your own or edited account.",
        );
        return;
      }
      try {
        dispatch({
          type: "generated",
          result: validateGeneration(sample.output, account),
          revision: state.revision,
        });
      } catch {
        setError(
          "This sample could not be validated. Reset the workspace and load it again.",
        );
      }
      return;
    }
    if (staticDemo) {
      setError("Live AI generation is unavailable on this sample website. Choose one of the fictional sample accounts.");
      return;
    }
    setBusy(true);
    const id = ++requestId.current;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
        signal: AbortSignal.timeout(55000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ||
            "The request failed. Your account brief is preserved; please retry.",
        );
      const validated = validateGeneration(data.result, parsed.data);
      if (requestId.current === id)
        dispatch({
          type: "generated",
          result: validated,
          revision: state.revision,
        });
    } catch (error) {
      if (requestId.current === id)
        setError(
          error instanceof Error && error.name === "TimeoutError"
            ? "The request timed out. Your inputs are preserved; please retry."
            : error instanceof Error
              ? error.message
              : "Could not generate a package. Your inputs are preserved.",
        );
    } finally {
      if (requestId.current === id) setBusy(false);
    }
  }
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${draft.subject}\n\n${draft.body}`,
      );
      setNotice("Current subject and email copied.");
    } catch {
      setError(
        "Clipboard access is unavailable. Select and copy the subject and body directly from the editable fields.",
      );
    }
  }
  function exportPackage(format: "md" | "json") {
    if (!pkg) return;
    const blob = new Blob(
      [format === "md" ? toMarkdown(pkg) : JSON.stringify(pkg, null, 2)],
      {
        type:
          format === "md"
            ? "text/markdown;charset=utf-8"
            : "application/json;charset=utf-8",
      },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      account.company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 60) || "account"
    }-${approvedAt ? "reviewed" : "unreviewed"}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      `${format === "md" ? "Markdown" : "JSON"} exported with the current outreach draft.`,
    );
  }
  const input = (
    field: keyof Account,
    label: string,
    placeholder: string,
    maxLength: number,
    area = false,
  ) => (
    <label className={`field ${area ? "full-width" : ""}`}>
      <span>
        {label}
        {field === "url" && <span className="optional">Optional</span>}
        {field === "company" && <span className="required">*</span>}
      </span>
      {area ? (
        <textarea
          value={account[field]}
          onChange={(event) => editAccount(field, event.target.value)}
          placeholder={placeholder}
          rows={field === "notes" ? 4 : 2}
          maxLength={maxLength}
          disabled={busy}
        />
      ) : (
        <input
          value={account[field]}
          onChange={(event) => editAccount(field, event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={busy}
          type={field === "url" ? "url" : "text"}
          required={field === "company"}
        />
      )}
      {field === "notes" && (
        <span className="field-hint">
          Paste relevant website information. Only this text is used as source
          evidence.
        </span>
      )}
      {field === "url" && (
        <span className="field-hint">
          For reference only. The website will not be fetched.
        </span>
      )}
    </label>
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <div className="app-main">
        <header className="topbar">
          <div className="brand">
            <div className="brand-symbol">
              <Waveform size={25} weight="bold" />
            </div>
            <div>
              <strong>Voice AI</strong>
              <span>PROSPECTING WORKFLOW</span>
            </div>
          </div>
          <div className="topbar-actions">
            <Link className="text-button" href="/showcase"><ArrowLeft size={16} />Showcase</Link>
            <button
              className="text-button map-trigger"
              onClick={() => mapDialog.current?.showModal()}
            >
              <GitBranch size={17} />
              Workflow map
            </button>
            <span className="session-note">
              <LockSimple size={13} />
              In-memory session
            </span>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => resetDialog.current?.showModal()}
            >
              <ArrowCounterClockwise size={15} />
              Reset workspace
            </button>
          </div>
        </header>
        <main id="workspace">
          <section className="intro">
            <div>
              <div className="eyebrow">Portfolio Prototype</div>
              <h1>
                Voice AI Prospecting Workflow
                <span className="title-dot">.</span>
              </h1>
              <p>
                Turn account research into a focused outreach plan and a
                review-ready sales handoff.
              </p>
            </div>
          </section>
          <nav className="workflow-rail" aria-label="Preparation workflow">
            {stages.map((item, index) => {
              const Icon = item.icon;
              const done =
                index === 0
                  ? !!result && !outdated
                  : index === 4
                    ? !!approvedAt
                    : !!result && !outdated && stage > index;
              const status =
                outdated && index > 0
                  ? "Outdated"
                  : stage === index
                    ? "In progress"
                    : done
                      ? "Complete"
                      : result
                        ? "Ready"
                        : "Not started";
              return (
                <button
                  key={item.title}
                  className={`rail-step ${stage === index ? "active" : ""} ${done ? "complete" : ""}`}
                  onClick={() => navigate(index)}
                  disabled={busy || (index > 0 && !result)}
                  aria-current={stage === index ? "step" : undefined}
                  aria-label={`${index + 1}. ${item.title}: ${status}`}
                >
                  <span className="rail-icon">
                    {done ? (
                      <Check size={18} weight="bold" />
                    ) : (
                      <Icon size={20} />
                    )}
                  </span>
                  <span className="rail-text">
                    <strong>{item.title}</strong>
                    <small>{stage === index ? item.sub : status}</small>
                  </span>
                  <span className="rail-number">0{index + 1}</span>
                </button>
              );
            })}
          </nav>
          <div className="workspace-toolbar">
            <div className="workspace-caption">
              <span className="step-fraction">
                Step {stage + 1}
                <span> of 5</span>
              </span>
              <span>
                {stage === 0 ? "Start with the source" : account.company}
              </span>
            </div>
            <div className="mode-switch" role="group" aria-label="Output mode">
              {!staticDemo && <button
                className={mode === "sample" ? "selected" : ""}
                aria-pressed={mode === "sample"}
                onClick={() => selectMode("sample")}
                disabled={busy}
              >
                <Flask size={14} />
                Sample output mode
              </button>}
              <button
                className={mode === "live" ? "selected" : ""}
                aria-pressed={mode === "live"}
                onClick={() => selectMode("live")}
                disabled={busy}
              >
                <Waveform size={14} />
                Live AI mode
              </button>
            </div>
          </div>
          {!staticDemo && mode === "live" && (
            <div className="mode-notice">
              <Info size={17} />
              <div>
                <strong>
                  {configured === null
                    ? "Checking server configuration…"
                    : configured
                      ? "Live AI is configured"
                      : "Live generation is unavailable"}
                </strong>
                <p>
                  {configured
                    ? "Generating sends your supplied account fields to the configured OpenAI model. Source URLs are never fetched."
                    : statusError
                      ? "Could not check the server. Retry the connection check or use a fictional sample."
                      : "Add your API key to .env.local and restart the server, or try a fictional account in Sample output mode."}
                </p>
              </div>
              <button
                className="text-button"
                onClick={() => void checkConnection()}
                disabled={configured === null || busy}
              >
                Recheck
              </button>
            </div>
          )}
          {outdated && (
            <div className="outdated-notice" role="status">
              <WarningCircle size={20} />
              <div>
                <strong>Results are outdated</strong>
                <p>
                  Your source inputs or output mode changed. Regenerate before
                  continuing, reviewing, or exporting.
                </p>
              </div>
              <button className="secondary small" onClick={() => navigate(0)}>
                Edit & regenerate
              </button>
            </div>
          )}
          <div className="workspace-layout">
            <section className="workspace-panel" aria-busy={busy}>
              <header className="panel-header">
                <div>
                  <h2 tabIndex={-1} ref={titleRef}>
                    {stages[stage].title}
                  </h2>
                  <p>{descriptions[stage]}</p>
                </div>
                <Label>
                  {approvedAt && stage === 4
                    ? "Reviewed"
                    : outdated
                      ? "Outdated"
                      : stage === 0
                        ? sample
                          ? "Sample loaded"
                          : "Your starting point"
                        : mode === "sample"
                          ? "Prewritten sample"
                          : "AI-generated"}
                </Label>
              </header>
              {error && (
                <div className="error-box" role="alert">
                  <WarningCircle size={19} />
                  <p>{error}</p>
                </div>
              )}
              {stage === 0 && (
                <div className="panel-content">
                  <div className="sample-callout">
                    <div className="sample-callout-icon">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <strong>
                        {sample
                          ? account.company
                          : "A blank page, or a head start."}
                      </strong>
                      <p>
                        {sample
                          ? "Fictional sample account · Prewritten outputs available"
                          : "Explore the workflow with a fictional MENA business."}
                      </p>
                    </div>
                    <button
                      className="sample-button"
                      onClick={() => sampleDialog.current?.showModal()}
                      disabled={busy}
                    >
                      {sample ? "Change sample" : "Try a sample account"}
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <form
                    id="account-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void generate();
                    }}
                  >
                    <div className="form-grid brief-grid">
                      {input(
                        "company",
                        "Company name",
                        "e.g. Your target account",
                        160,
                      )}
                      {input(
                        "market",
                        "Market",
                        "e.g. United Arab Emirates",
                        160,
                      )}
                      <div className="industry-field">
                        {input(
                          "industry",
                          "Industry",
                          "e.g. Education technology",
                          160,
                        )}
                      </div>
                      {input(
                        "description",
                        "Business description",
                        "What does the company do, and who does it serve?",
                        3000,
                        true,
                      )}
                      {input(
                        "notes",
                        "Source notes",
                        "Paste relevant information from the company website here…",
                        16000,
                        true,
                      )}
                      <div className="full-width">
                        {input("url", "Source URL", "https://", 2000)}
                      </div>
                    </div>
                  </form>
                  {mode === "sample" && !sample && account.company && (
                    <p className="inline-info">
                      <Info size={15} />
                      {staticDemo
                        ? "This public demo uses sample accounts only. Load an unchanged fictional account to continue."
                        : "Custom or edited accounts need Live AI mode. Sample outputs require an unchanged fictional account."}
                    </p>
                  )}
                  <p className="source-boundary">
                    <ShieldCheck size={15} />
                    Your sources set the boundaries. Missing details stay
                    unknown.
                  </p>
                </div>
              )}
              {stage === 1 && result && (
                <div className="panel-content analysis-content">
                  <div className="priority-block">
                    <div>
                      <span className="section-kicker">ACCOUNT PRIORITY</span>
                      <h3>
                        {result.priority}
                        <ArrowUpRight size={23} />
                      </h3>
                    </div>
                    <p>{result.rationale}</p>
                  </div>
                  <div className="section-heading">
                    <h3>What the sources tell us</h3>
                    <Label kind="evidence">Provided evidence</Label>
                  </div>
                  <div className="evidence-list">
                    {result.evidence.length ? (
                      result.evidence.map((item, index) => (
                        <div className="evidence-item" key={index}>
                          <span className="evidence-number">0{index + 1}</span>
                          <div>
                            <blockquote>“{item.quote}”</blockquote>
                            <p>{item.relevance}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="empty-evidence">
                        No supporting source evidence was supplied. Research is
                        needed before assessing fit.
                      </p>
                    )}
                  </div>
                  <div className="hypothesis-block">
                    <Label kind="hypothesis">Hypothesis</Label>
                    <p>{result.hypothesis}</p>
                  </div>
                  <div className="split-sections">
                    <section>
                      <h3>Potential blockers</h3>
                      <NotesList items={result.blockers} />
                    </section>
                    <section>
                      <div className="section-heading">
                        <h3>Still to learn</h3>
                        <Label kind="unknown">Unknown</Label>
                      </div>
                      <NotesList items={result.unknowns} />
                    </section>
                  </div>
                </div>
              )}
              {stage === 2 && result && (
                <div className="panel-content">
                  <div className="usecase-heading">
                    <span className="usecase-icon">
                      <Waveform size={29} />
                    </span>
                    <div>
                      <Label kind="hypothesis">Proposed use case</Label>
                      <h3>{result.useCase.title}</h3>
                    </div>
                  </div>
                  <div className="usecase-section">
                    <h3>The business problem</h3>
                    <p>{result.useCase.problem}</p>
                  </div>
                  <div className="hypothesis-block">
                    <Label kind="hypothesis">
                      Potential value · Hypothesis
                    </Label>
                    <p>{result.useCase.valueHypothesis}</p>
                  </div>
                  <div className="buyer-row">
                    <div>
                      <span className="section-kicker">
                        SUGGESTED BUYER FUNCTION
                      </span>
                      <strong>{result.useCase.buyer}</strong>
                    </div>
                    <span className="muted">To validate in discovery</span>
                  </div>
                  <div className="section-heading">
                    <h3>Open the right conversation</h3>
                    <span className="muted">3 discovery questions</span>
                  </div>
                  <ol className="questions">
                    {result.useCase.questions.map((question, index) => (
                      <li key={question}>
                        <span>0{index + 1}</span>
                        <p>{question}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="pilot-block">
                    <Flask size={22} />
                    <div>
                      <h3>What a pilot needs to validate</h3>
                      <p>{result.useCase.pilot}</p>
                    </div>
                  </div>
                </div>
              )}
              {stage === 3 && result && (
                <div className="panel-content">
                  <div className="email-toolbar">
                    <div>
                      <EnvelopeSimple size={17} />
                      <span>Email draft</span>
                      <Label>Editable</Label>
                    </div>
                    <span
                      className={`word-count ${bodyWords < 80 || bodyWords > 120 ? "outside-range" : ""}`}
                    >
                      {bodyWords} words <span>/ target 80–120</span>
                    </span>
                  </div>
                  <div className="email-editor">
                    <label className="subject-field">
                      <span>Subject</span>
                      <input
                        aria-label="Email subject"
                        value={draft.subject}
                        maxLength={180}
                        disabled={outdated}
                        onChange={(event) =>
                          editDraft({ ...draft, subject: event.target.value })
                        }
                      />
                    </label>
                    <label className="body-field">
                      <span className="sr-only">Email body</span>
                      <textarea
                        aria-label="Email body"
                        value={draft.body}
                        maxLength={5000}
                        disabled={outdated}
                        onChange={(event) =>
                          editDraft({ ...draft, body: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div className="draft-actions">
                    <button
                      className="secondary"
                      disabled={outdated}
                      onClick={() => void copyDraft()}
                    >
                      <Copy size={16} />
                      Copy draft
                    </button>
                    <button
                      className="text-button"
                      disabled={
                        outdated ||
                        (draft.subject === result.outreach.subject &&
                          draft.body === result.outreach.body)
                      }
                      onClick={() => {
                        editDraft({ ...result.outreach });
                        setNotice(
                          "Generated draft restored. Review it before approving.",
                        );
                      }}
                    >
                      <ArrowCounterClockwise size={15} />
                      Reset to generated draft
                    </button>
                  </div>
                  <p className="inline-info">
                    <Info size={16} />
                    Personalize the sign-off and verify every claim before using
                    this draft. Email is never sent from this demo.
                  </p>
                </div>
              )}
              {stage === 4 && result && (
                <div className="panel-content">
                  <div
                    className={`review-banner ${approvedAt ? "approved" : ""}`}
                  >
                    <ShieldCheck size={27} />
                    <div>
                      <h3>
                        {approvedAt
                          ? "Preparation package approved"
                          : "Your judgment is the final step"}
                      </h3>
                      <p>
                        {approvedAt
                          ? "Materials reviewed. No reply, qualification, or meeting is implied."
                          : "Check the evidence, challenge the hypothesis, and read the email before approving."}
                      </p>
                    </div>
                  </div>
                  <fieldset className="review-checklist" disabled={outdated}>
                    <legend className="sr-only">Human-review checklist</legend>
                    {checks.map((label, index) => (
                      <label key={label}>
                        <input
                          type="checkbox"
                          checked={state.checks[index]}
                          onChange={(event) =>
                            dispatch({
                              type: "check",
                              index,
                              value: event.target.checked,
                            })
                          }
                        />
                        <span>{label}</span>
                        <span className="check-description">
                          {
                            [
                              "Matches the supplied source notes",
                              "Plausible, with clear unknowns",
                              "Accurate, relevant, and ready for review",
                            ][index]
                          }
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="approval-actions">
                    <button
                      className="primary"
                      disabled={!canApprove || !!approvedAt}
                      onClick={() => {
                        dispatch({
                          type: "approve",
                          at: new Date().toISOString(),
                        });
                        setNotice(
                          "Preparation approved. Commercial status remains Discovery pending.",
                        );
                      }}
                    >
                      <CheckCircle size={17} />
                      {approvedAt
                        ? "Preparation approved"
                        : "Approve preparation package"}
                    </button>
                    <button
                      className="text-button"
                      onClick={() => navigate(outdated ? 0 : 3)}
                    >
                      <PencilSimple size={15} />
                      Return to edit
                    </button>
                  </div>
                  {!canApprove && !approvedAt && (
                    <p className="field-hint">
                      Complete all three checks with a non-empty, current draft
                      to approve.
                    </p>
                  )}
                  <div className="handoff-header">
                    <div>
                      <span className="section-kicker">
                        PREPARATION SUMMARY
                      </span>
                      <h3>Ready for the next conversation</h3>
                    </div>
                    <Label>
                      {approvedAt ? "Reviewed" : "Unreviewed draft"}
                    </Label>
                  </div>
                  <div className="commercial-status">
                    <span>Commercial status</span>
                    <strong>
                      <Circle size={10} weight="fill" />
                      Discovery pending
                    </strong>
                  </div>
                  {pkg ? (
                    <div className="handoff-content">
                      <section>
                        <h4>Account overview</h4>
                        <p>
                          <strong>{account.company}</strong> ·{" "}
                          {account.market || "Market unknown"} ·{" "}
                          {account.industry || "Industry unknown"}
                        </p>
                        <p>
                          {account.description ||
                            "No business description supplied."}
                        </p>
                      </section>
                      <section>
                        <h4>Priority & rationale</h4>
                        <p>
                          <strong>{result.priority}</strong> ·{" "}
                          {result.rationale}
                        </p>
                      </section>
                      <section>
                        <h4>Supporting evidence</h4>
                        {result.evidence.length ? (
                          <NotesList
                            items={result.evidence.map((item) => item.quote)}
                          />
                        ) : (
                          <p>No supporting source evidence supplied.</p>
                        )}
                      </section>
                      <section>
                        <h4>
                          Proposed use case{" "}
                          <Label kind="hypothesis">Hypothesis</Label>
                        </h4>
                        <p>
                          <strong>{result.useCase.title}</strong> ·{" "}
                          {result.useCase.valueHypothesis}
                        </p>
                        <p>
                          Suggested buyer function:{" "}
                          <strong>{result.useCase.buyer}</strong>
                        </p>
                      </section>
                      <section>
                        <h4>Discovery questions</h4>
                        <NotesList items={result.useCase.questions} />
                      </section>
                      <section>
                        <h4>Important unknowns</h4>
                        <NotesList items={result.unknowns} />
                      </section>
                      <section>
                        <h4>
                          {approvedAt
                            ? "Reviewed outreach draft"
                            : "Outreach draft · Unreviewed"}
                        </h4>
                        <p>
                          <strong>{draft.subject}</strong>
                        </p>
                        <p className="email-preview">{draft.body}</p>
                      </section>
                      <section className="next-action">
                        <h4>Recommended next action</h4>
                        <p>{pkg.recommendedNextAction}</p>
                      </section>
                    </div>
                  ) : (
                    <p className="inline-info">
                      The previous summary is outdated. Return to the account
                      brief and regenerate it.
                    </p>
                  )}
                  <div className="export-row">
                    <div>
                      <strong>Take the preparation with you</strong>
                      <p>
                        {approvedAt
                          ? "Includes your reviewed email and approval status."
                          : "Exports will be clearly labeled Unreviewed draft."}
                      </p>
                    </div>
                    <div>
                      <button
                        className="secondary"
                        disabled={!pkg}
                        onClick={() => exportPackage("md")}
                      >
                        <DownloadSimple size={15} />
                        Markdown
                      </button>
                      <button
                        className="secondary"
                        disabled={!pkg}
                        onClick={() => exportPackage("json")}
                      >
                        <DownloadSimple size={15} />
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <footer className="panel-footer">
                <div>
                  {stage > 0 ? (
                    <button
                      className="text-button"
                      onClick={() => navigate(stage - 1)}
                      disabled={busy}
                    >
                      <ArrowLeft size={16} />
                      Back
                    </button>
                  ) : (
                    <span className="footer-note">
                      A clear brief makes a better first conversation.
                    </span>
                  )}
                </div>
                {stage === 0 ? (
                  <button
                    className="primary"
                    type="submit"
                    form="account-form"
                    disabled={busy || !account.company.trim()}
                  >
                    {busy
                      ? "Generating preparation…"
                      : outdated
                        ? "Regenerate preparation"
                        : mode === "sample"
                          ? "Explore account fit"
                          : "Generate preparation"}
                    {!busy && <ArrowRight size={17} />}
                  </button>
                ) : stage < 4 ? (
                  <button
                    className="primary"
                    disabled={
                      outdated ||
                      (stage === 3 &&
                        (!draft.subject.trim() || !draft.body.trim()))
                    }
                    onClick={() => navigate(stage + 1)}
                  >
                    {
                      [
                        "",
                        "Next: Voice AI use case",
                        "Next: Outreach draft",
                        "Next: Review & handoff",
                      ][stage]
                    }
                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <span className="footer-note">
                    <ShieldCheck size={15} />
                    Prepared for a human decision.
                  </span>
                )}
              </footer>
            </section>
            <PreparationContext
              state={state}
              openMap={() => mapDialog.current?.showModal()}
            />
          </div>
          <footer className="page-footer">
            <span>Independent demo. Not an official ElevenLabs product.</span>
            <span>
              <GlobeHemisphereEast size={15} />
              MENA focus · English-language demo
            </span>
          </footer>
        </main>
      </div>
      <div className="toast" role="status" aria-live="polite">
        {notice && (
          <>
            <CheckCircle size={18} />
            {notice}
          </>
        )}
      </div>
      <WorkflowMap dialogRef={mapDialog} />
      <dialog
        ref={sampleDialog}
        className="sample-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget)
            sampleDialog.current?.close();
        }}
      >
        <div className="dialog-header">
          <div>
            <span className="section-kicker">A PLACE TO START</span>
            <h2>Choose a sample account</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close sample accounts"
            onClick={() => sampleDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          Three fictional businesses. Three different reasons to explore voice
          AI. Loading a sample replaces the current preparation.
        </p>
        <div className="sample-options">
          {samples.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                dispatch({ type: "load", account: item.account });
                setError("");
                sampleDialog.current?.close();
                setNotice(
                  `${item.account.company} loaded. This is a fictional sample account.`,
                );
              }}
            >
              <span className="sample-monogram">{item.initials}</span>
              <span>
                <strong>{item.account.company}</strong>
                <span>
                  {item.account.market} · {item.sector}
                </span>
                <small>Fictional sample account</small>
              </span>
              <ArrowUpRight size={19} />
            </button>
          ))}
        </div>
        <p className="dialog-footnote">
          <Flask size={15} />
          Sample output mode uses prewritten examples, not live AI generation.
        </p>
      </dialog>
      <dialog ref={resetDialog} className="reset-dialog">
        <div className="dialog-header">
          <h2>Start a fresh workspace?</h2>
          <button
            className="icon-button"
            aria-label="Close reset dialog"
            onClick={() => resetDialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          This clears the account brief, generated materials, email edits, and
          approval from this session. Export anything you want to keep first.
        </p>
        <div className="dialog-actions">
          <button
            className="secondary"
            autoFocus
            onClick={() => resetDialog.current?.close()}
          >
            Keep working
          </button>
          <button
            className="primary"
            onClick={() => {
              dispatch({ type: "reset" });
              setError("");
              resetDialog.current?.close();
              setNotice(
                "Workspace reset. Start fresh or load a sample account.",
              );
            }}
          >
            Reset workspace
          </button>
        </div>
      </dialog>
    </div>
  );
}
