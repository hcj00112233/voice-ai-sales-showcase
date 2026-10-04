import type { Account, Generation } from "./schema";
export type Sample = {
  id: string;
  initials: string;
  sector: string;
  account: Account;
  output: Generation;
};
const sharedUnknowns = [
  "Budget and buying timeline have not been provided.",
  "The current technology stack and vendors are unknown.",
  "The decision-maker and approval process need to be identified.",
];
export const samples: Sample[] = [
  {
    id: "lisan",
    initials: "Li",
    sector: "Language learning",
    account: {
      company: "Lisan Learning",
      market: "United Arab Emirates",
      industry: "Education technology",
      description:
        "A fictional UAE learning platform offering practical English lessons for adult learners.",
      notes:
        "Lisan Learning offers English courses for adult learners in the UAE. Lessons combine short reading exercises with recorded listening activities. The content team updates workplace conversation modules each month. Learners can replay audio examples at their own pace.",
      url: "",
    },
    output: {
      priority: "Explore",
      rationale:
        "Recurring updates to English listening content give a concrete reason to explore voice AI. The notes show a relevant workflow, but do not establish a buying need or readiness.",
      evidence: [
        {
          quote:
            "Lisan Learning offers English courses for adult learners in the UAE.",
          relevance:
            "English learning is directly relevant to a voice-content discovery conversation.",
        },
        {
          quote:
            "The content team updates workplace conversation modules each month.",
          relevance:
            "A recurring content cycle is an identifiable workflow to investigate.",
        },
        {
          quote: "Learners can replay audio examples at their own pace.",
          relevance:
            "Audio already has a role in the described learning experience.",
        },
      ],
      hypothesis:
        "AI-assisted narration could make it easier to test new listening exercises, if language quality and editorial control meet the team's requirements.",
      blockers: [
        "Pronunciation, accent expectations, and teaching accuracy would need human evaluation.",
        "Voice rights and editorial approval requirements need to be clarified.",
      ],
      unknowns: [
        "The effort involved in recording and updating lessons is unknown.",
        "Required English accents and learner accessibility needs are not specified.",
        ...sharedUnknowns,
      ],
      useCase: {
        title: "English lesson narration",
        problem:
          "Monthly updates may require repeated audio production and review. The notes do not say whether this is currently a bottleneck.",
        buyer: "Product / Learning Content",
        valueHypothesis:
          "AI-assisted narration could help the team explore new English listening exercises with a more flexible editing process.",
        questions: [
          "How does your team produce and approve audio for new lessons today?",
          "Which English accents, pronunciation standards, and teaching needs must the audio meet?",
          "What would make a small narration pilot useful enough to continue?",
        ],
        pilot:
          "Use a small set of approved scripts in English. Have educators assess pronunciation, clarity, and teaching suitability. Compare editing effort with the existing process, confirm voice permissions, and agree acceptance criteria before expanding.",
      },
      outreach: {
        subject: "Exploring English lesson audio at Lisan Learning",
        body: "Hi Lisan Learning team,\n\nI noticed that your workplace conversation modules are updated monthly, with audio examples learners can replay. That made me curious about how your content team produces and reviews new English listening exercises.\n\nOne idea worth exploring is AI-assisted narration for a small set of approved lesson scripts. It could offer more flexibility when updating exercises, provided pronunciation, language quality, and editorial control meet your teaching standards.\n\nWould you be open to a 15-minute discovery conversation about your current audio workflow and what a useful pilot would need to demonstrate?\n\nBest,\n[Your name]",
      },
    },
  },
  {
    id: "sahab",
    initials: "Sa",
    sector: "Content localization",
    account: {
      company: "Sahab Localization",
      market: "Saudi Arabia",
      industry: "Media & localization",
      description:
        "A fictional Saudi agency adapting training and brand content for English-speaking audiences.",
      notes:
        "Sahab Localization adapts English training videos and brand content for English-speaking audiences in Saudi Arabia. Its team handles translation, subtitle editing, and voice-over coordination. Client reviewers approve scripts before recording. Some projects require revisions after the first audio review.",
      url: "",
    },
    output: {
      priority: "Explore",
      rationale:
        "Voice-over coordination and audio revisions are explicitly described, creating a relevant workflow to explore. No evidence establishes dissatisfaction, budget, or purchase intent.",
      evidence: [
        {
          quote:
            "Its team handles translation, subtitle editing, and voice-over coordination.",
          relevance:
            "Voice production is part of the supplied service description.",
        },
        {
          quote: "Client reviewers approve scripts before recording.",
          relevance:
            "Existing approval gates would need to remain part of any pilot.",
        },
        {
          quote:
            "Some projects require revisions after the first audio review.",
          relevance:
            "Audio revision is a specific discovery topic, without assuming it is costly.",
        },
      ],
      hypothesis:
        "AI-assisted English narration could help explore revised voice-over drafts, subject to client permission and quality review.",
      blockers: [
        "Client contracts and voice permissions may restrict the use of synthetic narration.",
        "Narration style, terminology, and brand voice require editorial assessment.",
      ],
      unknowns: [
        "The frequency and effort of audio revisions are unknown.",
        "Client acceptance of synthetic narration has not been established.",
        ...sharedUnknowns,
      ],
      useCase: {
        title: "English voice-over draft revisions",
        problem:
          "Audio revisions may introduce additional coordination after review. The supplied notes do not quantify this effort or establish a bottleneck.",
        buyer: "Content Operations / Production",
        valueHypothesis:
          "Generating revised narration drafts could make client review more flexible, if rights, brand requirements, and narration quality are acceptable.",
        questions: [
          "What happens between script approval and final voice-over sign-off?",
          "Which voice rights and client permissions would be required for synthetic narration?",
          "How would your reviewers judge a revised audio draft against your current quality standards?",
        ],
        pilot:
          "Select one permissioned training script and a realistic revision. Have English editors compare clarity, terminology, and revision effort with the current process. Keep client approval in place and define acceptable quality before testing.",
      },
      outreach: {
        subject: "A question about Sahab's voice-over revisions",
        body: "Hi Sahab Localization team,\n\nI noticed that your team handles voice-over coordination and revisions after the first audio review. I was interested in how your production team manages those changes while keeping narration quality and client approval consistent.\n\nA possible use case is AI-assisted narration for revised drafts of an approved training script. It could make review iterations more flexible, but client permission, voice rights, and editorial standards would need to guide any test.\n\nWould you be open to a 15-minute discovery conversation about your revision workflow and the criteria you would use to evaluate a small pilot?\n\nBest,\n[Your name]",
      },
    },
  },
  {
    id: "bayt",
    initials: "Ba",
    sector: "E-commerce",
    account: {
      company: "Bayt Basket",
      market: "Gulf region",
      industry: "E-commerce & retail",
      description:
        "A fictional Gulf e-commerce business with English customer support operations.",
      notes:
        "Bayt Basket sells household essentials across Gulf markets. Its customer support team answers order, delivery, and return questions in English. Customers can contact support through a website form or email. The team maintains written answers to common support questions.",
      url: "",
    },
    output: {
      priority: "Research further",
      rationale:
        "English support and written answers are relevant starting points, but the notes describe text channels only. Research customer demand for audio and the support team's priorities before pursuing a voice use case.",
      evidence: [
        {
          quote:
            "Its customer support team answers order, delivery, and return questions in English.",
          relevance:
            "The supplied description establishes English support topics.",
        },
        {
          quote:
            "Customers can contact support through a website form or email.",
          relevance:
            "Only text-based channels are evidenced; a voice channel is not established.",
        },
        {
          quote:
            "The team maintains written answers to common support questions.",
          relevance:
            "Approved answers could be a starting point for a limited audio-content experiment.",
        },
      ],
      hypothesis:
        "Optional spoken FAQ answers might improve access for some customers, but demand for audio and its usefulness have not been demonstrated.",
      blockers: [
        "No customer demand for a voice experience is established.",
        "Support-policy accuracy, accessibility, and maintenance would need evaluation.",
      ],
      unknowns: [
        "Whether customers want spoken support content is unknown.",
        "Support volumes, channel preferences, and current service challenges are not provided.",
        ...sharedUnknowns,
      ],
      useCase: {
        title: "Spoken English FAQ answers",
        problem:
          "Some customers might prefer listening to common answers. The supplied information does not establish an unmet accessibility or support need.",
        buyer: "Customer Experience",
        valueHypothesis:
          "Optional audio versions of approved FAQs could offer another way to understand support policies, if customer research establishes a need.",
        questions: [
          "What do you know about customers' preferred language and support formats?",
          "Which common questions are suitable for general answers without account-specific information?",
          "What evidence would justify testing audio alongside your existing written FAQs?",
        ],
        pilot:
          "First confirm customer interest. Then test a small set of general, approved English FAQ recordings for comprehension, usefulness, and policy accuracy. Avoid personal account data and assess how content updates would be governed.",
      },
      outreach: {
        subject: "Exploring support content formats at Bayt Basket",
        body: "Hi Bayt Basket team,\n\nI noticed that your team provides English support, with written answers to common order, delivery, and return questions. I was curious whether customers have expressed a preference for listening to those answers as well as reading them.\n\nOne hypothesis is that optional spoken FAQ content could offer another way to understand support policies. That would only be worth testing if customer interest and content accuracy support the idea. I would like to understand whether customers see a need.\n\nWould you be open to a 15-minute discovery conversation about customer preferences and how you evaluate new support formats?\n\nBest,\n[Your name]",
      },
    },
  },
];
export function matchSample(account: Account) {
  return samples.find((sample) =>
    (Object.keys(account) as (keyof Account)[]).every(
      (key) => sample.account[key] === account[key],
    ),
  );
}
