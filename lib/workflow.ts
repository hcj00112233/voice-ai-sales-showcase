import {
  emptyAccount,
  type Account,
  type Draft,
  type Generation,
  type Mode,
} from "./schema";

export type WorkflowState = {
  account: Account;
  mode: Mode;
  stage: number;
  revision: number;
  result: Generation | null;
  generatedAccount: Account | null;
  outdated: boolean;
  draft: Draft;
  checks: [boolean, boolean, boolean];
  approvedAt: string | null;
};
export function initialState(): WorkflowState {
  return {
    account: { ...emptyAccount },
    mode: "sample",
    stage: 0,
    revision: 0,
    result: null,
    generatedAccount: null,
    outdated: false,
    draft: { subject: "", body: "" },
    checks: [false, false, false],
    approvedAt: null,
  };
}
export type Action =
  | { type: "account"; field: keyof Account; value: string }
  | { type: "load"; account: Account }
  | { type: "mode"; mode: Mode }
  | { type: "generated"; result: Generation; revision: number }
  | { type: "stage"; stage: number }
  | { type: "draft"; draft: Draft }
  | { type: "check"; index: number; value: boolean }
  | { type: "approve"; at: string }
  | { type: "reset" };
export function workflowReducer(
  state: WorkflowState,
  action: Action,
): WorkflowState {
  switch (action.type) {
    case "account":
      return {
        ...state,
        account: { ...state.account, [action.field]: action.value },
        revision: state.revision + 1,
        outdated: !!state.result,
        checks: [false, false, false],
        approvedAt: null,
      };
    case "load":
      return {
        ...initialState(),
        account: { ...action.account },
        revision: state.revision + 1,
      };
    case "mode":
      return {
        ...state,
        mode: action.mode,
        revision: state.revision + 1,
        outdated: !!state.result,
        approvedAt: null,
        checks: [false, false, false],
      };
    case "generated":
      if (action.revision !== state.revision) return state;
      return {
        ...state,
        result: action.result,
        generatedAccount: { ...state.account },
        draft: { ...action.result.outreach },
        stage: 1,
        outdated: false,
        approvedAt: null,
        checks: [false, false, false],
      };
    case "stage":
      return {
        ...state,
        stage:
          action.stage >= 0 &&
          action.stage <= 4 &&
          (action.stage === 0 || !!state.result)
            ? action.stage
            : state.stage,
      };
    case "draft":
      return {
        ...state,
        draft: action.draft,
        approvedAt: null,
        checks: [state.checks[0], state.checks[1], false],
      };
    case "check": {
      const checks = [...state.checks] as WorkflowState["checks"];
      checks[action.index] = action.value;
      return { ...state, checks, approvedAt: null };
    }
    case "approve":
      return state.result &&
        !state.outdated &&
        state.checks.every(Boolean) &&
        state.draft.subject.trim() &&
        state.draft.body.trim()
        ? { ...state, approvedAt: action.at }
        : state;
    case "reset":
      return { ...initialState(), revision: state.revision + 1 };
  }
}

export function preparationPackage(state: WorkflowState) {
  if (!state.result || !state.generatedAccount || state.outdated)
    throw new Error("Regenerate outdated results before exporting.");
  return {
    title: "Voice AI Prospecting Workflow",
    reviewStatus: state.approvedAt
      ? "Approved preparation package"
      : "Unreviewed draft",
    commercialStatus: "Discovery pending",
    approvalMeaning:
      "Preparation materials reviewed only. No prospect reply, qualification, or meeting is implied.",
    approvedAt: state.approvedAt,
    mode:
      state.mode === "sample"
        ? "Sample output mode: prewritten fictional example"
        : "Live AI mode",
    account: state.generatedAccount,
    priority: state.result.priority,
    rationale: state.result.rationale,
    providedEvidence: state.result.evidence,
    hypothesis: state.result.hypothesis,
    potentialBlockers: state.result.blockers,
    importantUnknowns: state.result.unknowns,
    proposedUseCase: state.result.useCase,
    outreachDraft: { ...state.draft },
    reviewChecklist: {
      evidenceChecked: state.checks[0],
      hypothesisReviewed: state.checks[1],
      outreachReviewed: state.checks[2],
    },
    recommendedNextAction:
      state.result.priority === "Deprioritize"
        ? "Document the mismatch and revisit only if new evidence changes the fit."
        : state.result.priority === "Research further"
          ? "Research the documented unknowns before deciding whether to request a discovery conversation."
          : "Identify the relevant buyer and consider requesting a short discovery conversation after human review.",
    disclaimer:
      "Independent portfolio prototype. Not an official ElevenLabs product. No customers, sales results, or production use are claimed.",
  };
}
// Escape user-controlled Markdown so supplied text cannot create misleading headings or links.
const md = (value: string) =>
  value.replace(/([\\`*_{}\[\]<>()#+.!|~-])/g, "\\$1");
export function toMarkdown(pkg: ReturnType<typeof preparationPackage>) {
  const list = (items: string[]) =>
    items.map((item) => `- ${md(item)}`).join("\n");
  return `# ${pkg.title}\n\n**${pkg.reviewStatus}**\n\nCommercial status: ${pkg.commercialStatus}\n\n${pkg.approvalMeaning}\n\nMode: ${pkg.mode}\nApproved at: ${pkg.approvedAt ?? "Not approved"}\n\n## Account overview\n${md(pkg.account.company)} | ${md(pkg.account.market || "Unknown market")} | ${md(pkg.account.industry || "Unknown industry")}\n\n${md(pkg.account.description || "Description not provided.")}\n\nSource URL: ${md(pkg.account.url || "Not supplied")}\n\n## Priority and rationale\n${pkg.priority}\n\n${md(pkg.rationale)}\n\n## Provided evidence\n${pkg.providedEvidence.length ? pkg.providedEvidence.map((item) => `> ${md(item.quote)}\n\n${md(item.relevance)}`).join("\n\n") : "No supporting source evidence provided."}\n\n## Hypothesis\n${md(pkg.hypothesis)}\n\n## Potential blockers\n${list(pkg.potentialBlockers)}\n\n## Proposed use case\n${md(pkg.proposedUseCase.title)}\n\nBusiness problem: ${md(pkg.proposedUseCase.problem)}\n\nSuggested buyer function (hypothesis): ${md(pkg.proposedUseCase.buyer)}\n\nValue hypothesis: ${md(pkg.proposedUseCase.valueHypothesis)}\n\n## Discovery questions\n${list(pkg.proposedUseCase.questions)}\n\n## Pilot validation\n${md(pkg.proposedUseCase.pilot)}\n\n## Important unknowns\n${list(pkg.importantUnknowns)}\n\n## ${pkg.approvedAt ? "Reviewed outreach draft" : "Outreach draft (unreviewed)"}\nSubject: ${md(pkg.outreachDraft.subject)}\n\n${md(pkg.outreachDraft.body)}\n\n## Human review\n- [${pkg.reviewChecklist.evidenceChecked ? "x" : " "}] Evidence checked\n- [${pkg.reviewChecklist.hypothesisReviewed ? "x" : " "}] Use-case hypothesis reviewed\n- [${pkg.reviewChecklist.outreachReviewed ? "x" : " "}] Outreach draft reviewed\n\n## Recommended next action\n${md(pkg.recommendedNextAction)}\n\n## Supplied source notes\n${md(pkg.account.notes || "Not supplied")}\n\n---\n${pkg.disclaimer}\n`;
}
