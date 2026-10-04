"use client";

import {
  ArrowRight,
  Check,
  Circle,
  FileText,
  GitBranch,
  ShieldCheck,
  WarningCircle,
} from "@phosphor-icons/react";
import type { WorkflowState } from "@/lib/workflow";

const guidance = [
  {
    title: "Give the research a starting point.",
    body: "Bring the facts you have. Leave room for what you still need to learn.",
    next: "An evidence-led fit assessment",
    action: "Account context → a reason to explore",
  },
  {
    title: "A relevant signal. An open question.",
    body: "A source can establish relevance. It cannot establish readiness to buy.",
    next: "One focused voice AI hypothesis",
    action: "Evidence → a question worth asking",
  },
  {
    title: "Make the idea testable.",
    body: "Use discovery to understand the workflow, its constraints, and what a useful pilot would prove.",
    next: "An editable outreach email",
    action: "A business problem → a conversation",
  },
  {
    title: "Make it sound like you.",
    body: "Keep the observation specific, the value conditional, and the request easy to answer.",
    next: "Your review and an AE handoff",
    action: "An edited draft → human review",
  },
  {
    title: "Review the preparation, then decide.",
    body: "Approval covers these materials. Qualification and a meeting still depend on discovery.",
    next: "Markdown or JSON preparation package",
    action: "Human review → a considered next step",
  },
];

export default function PreparationContext({
  state,
  openMap,
}: {
  state: WorkflowState;
  openMap: () => void;
}) {
  const item = guidance[state.stage];
  const lines =
    state.stage === 0
      ? [
          {
            title: "Account context",
            value: state.account.company
              ? state.account.company
              : "Add the company you are researching",
            done: !!state.account.company,
          },
          {
            title: "Source evidence",
            value: state.account.notes.trim()
              ? "Source notes supplied"
              : "Paste relevant website information",
            done: !!state.account.notes.trim(),
          },
          {
            title: "Reference URL",
            value: state.account.url
              ? "Included for reference only"
              : "Optional. No website is fetched.",
            done: !!state.account.url,
          },
        ]
      : state.stage === 4
        ? [
            {
              title: "Evidence",
              value: state.checks[0]
                ? "Checked against supplied notes"
                : "Awaiting your review",
              done: state.checks[0],
            },
            {
              title: "Use-case hypothesis",
              value: state.checks[1]
                ? "Reviewed by you"
                : "Awaiting your review",
              done: state.checks[1],
            },
            {
              title: "Outreach draft",
              value: state.checks[2]
                ? "Current draft reviewed"
                : "Awaiting your review",
              done: state.checks[2],
            },
          ]
        : [
            { title: "Account", value: state.account.company, done: true },
            {
              title: "Priority",
              value: state.outdated
                ? "Outdated. Regenerate to reassess."
                : (state.result?.priority ?? "Not assessed"),
              done: !state.outdated,
            },
            {
              title: "Suggested buyer",
              value: state.outdated
                ? "Reassess after regeneration"
                : (state.result?.useCase.buyer ?? "Unknown"),
              done: false,
            },
          ];
  return (
    <aside className="preparation-context" aria-label="Preparation companion">
      <div className="companion-title">
        <FileText size={16} />
        <span>{state.stage === 4 ? "Review status" : "Preparation notes"}</span>
      </div>
      <h3>{item.title}</h3>
      <p className="companion-intro">{item.body}</p>
      <dl className="context-facts">
        {lines.map((line) => (
          <div key={line.title}>
            <span className={`fact-marker ${line.done ? "done" : ""}`}>
              {line.done ? (
                <Check size={12} weight="bold" />
              ) : (
                <Circle size={10} />
              )}
            </span>
            <div>
              <dt>{line.title}</dt>
              <dd>{line.value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="next-deliverable">
        <span>WHAT COMES NEXT</span>
        <strong>{item.next}</strong>
        <div>
          <span className="connector-start" />
          <span className="connector-line" />
          <ArrowRight size={15} />
        </div>
        <p>{item.action}</p>
      </div>
      <div className={`review-status-note ${state.outdated ? "stale" : ""}`}>
        {state.outdated ? (
          <WarningCircle size={18} />
        ) : (
          <ShieldCheck size={18} />
        )}
        <div>
          <strong>
            {state.outdated
              ? "Regeneration needed"
              : state.approvedAt
                ? "Preparation reviewed"
                : "Human review required"}
          </strong>
          <p>
            {state.outdated
              ? "Updated inputs need a fresh preparation package."
              : state.approvedAt
                ? "Commercial status stays Discovery pending."
                : "Evidence, hypothesis, and outreach are yours to check."}
          </p>
        </div>
      </div>
      <button className="companion-map-link" onClick={openMap}>
        <GitBranch size={16} />
        See how the workflow connects
        <ArrowRight size={14} />
      </button>
    </aside>
  );
}
