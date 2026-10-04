export type ShowcaseScene = {
  id: string;
  label: string;
  topic: string;
  title: string;
  description: string;
  outcome: string;
  boundary: string;
  pilotMeasure: string;
  steps: {
    label: string;
    speaker: string;
    en: string;
    insight: string;
  }[];
};

// Authored illustrative scripts, separate from the account's quoted source notes.
export const showcaseScenes: ShowcaseScene[] = [
  {
    id: "lisan",
    label: "Learning",
    topic: "English lesson narration",
    title: "A lesson worth listening to.",
    description:
      "Explore a short English workplace lesson, from its opening prompt to a guided practice exercise.",
    outcome:
      "A repeatable listening exercise that a content team could edit and review.",
    boundary:
      "An educator must review pronunciation and teaching suitability. This script does not demonstrate a production tutoring agent.",
    pilotMeasure:
      "Educator approval, learner comprehension, and time spent revising one lesson against the current process.",
    steps: [
      {
        label: "Introduce",
        speaker: "Lesson narrator",
        en: "Let’s practise a workplace conversation. You would like to arrange a meeting with a colleague.",
        insight:
          "Start with an approved lesson script. Keep the learning objective clear through each practice moment.",
      },
      {
        label: "Demonstrate",
        speaker: "Lesson narrator",
        en: "You could say: Could we meet tomorrow morning to discuss the project? Listen again, then try saying it yourself.",
        insight:
          "Replay supports listening practice. No assessment of the learner’s pronunciation is claimed.",
      },
      {
        label: "Reinforce",
        speaker: "Lesson narrator",
        en: "Now change one detail. Ask to meet tomorrow afternoon instead. Your teacher can help you check your answer.",
        insight:
          "Keep the educator in the loop. A useful pilot tests comprehension and editorial effort.",
      },
    ],
  },
  {
    id: "sahab",
    label: "Localization",
    topic: "English voice-over draft revisions",
    title: "One story. Another audience.",
    description:
      "Follow a training voice-over from its source message to a revised draft ready for editorial review.",
    outcome:
      "A revised narration draft that keeps client approval in the production process.",
    boundary:
      "Translation, terminology, voice rights, and client permission require review. Device voices cannot demonstrate voice consistency.",
    pilotMeasure:
      "English editorial quality, terminology accuracy, and revision effort on one permissioned training script.",
    steps: [
      {
        label: "Source",
        speaker: "Training narrator",
        en: "Welcome to your first day. This short guide explains how to find the resources you need.",
        insight:
          "Begin with a permissioned source script. Confirm the intended audience and Narration style.",
      },
      {
        label: "Revise",
        speaker: "Revised narration",
        en: "Open the team portal and select Learning resources. Your onboarding checklist is available there.",
        insight:
          "A reviewer requests a clearer instruction. Update the script before creating a new narration draft.",
      },
      {
        label: "Review",
        speaker: "Closing narration",
        en: "If you need help, contact your team coordinator. They can guide you through the next steps.",
        insight:
          "The draft still needs English editorial and client approval. Faster iteration remains a hypothesis to test.",
      },
    ],
  },
  {
    id: "bayt",
    label: "Customer care",
    topic: "Spoken English FAQ answers",
    title: "An answer. A clear next step.",
    description:
      "Explore an illustrative order FAQ and the point where an account-specific question needs a person.",
    outcome:
      "A general answer with a clear route to human support, if customers want an audio option.",
    boundary:
      "No order lookup or handoff occurs. This concept uses no customer data, and no voice channel is evidenced in the account notes.",
    pilotMeasure:
      "First establish customer demand. Then assess comprehension, policy accuracy, and usefulness of a small FAQ set.",
    steps: [
      {
        label: "Question",
        speaker: "Customer script",
        en: "Where can I find an update on my delivery? I would like to know what to do next.",
        insight:
          "An illustrative customer question, not a recorded call. Start with general information.",
      },
      {
        label: "Answer",
        speaker: "FAQ narrator",
        en: "For a question about your own order, please contact the support team through the website form or email.",
        insight:
          "These contact channels are supported by the fictional source notes. Do not invent a delivery status.",
      },
      {
        label: "Boundary",
        speaker: "FAQ narrator",
        en: "This audio guide cannot access your order details. A support team member can help you with your specific question.",
        insight:
          "Explain the limit clearly. The next commercial step is customer research, not an automation proposal.",
      },
    ],
  },
];
