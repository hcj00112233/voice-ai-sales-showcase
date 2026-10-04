import { z } from "zod";

export const accountSchema = z
  .object({
    company: z.string().trim().min(1, "Add a company name.").max(160),
    market: z.string().trim().max(160),
    industry: z.string().trim().max(160),
    description: z.string().trim().max(3000),
    notes: z.string().trim().max(16000),
    url: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => {
        if (!value) return true;
        try {
          return ["https:", "http:"].includes(new URL(value).protocol);
        } catch {
          return false;
        }
      }, "Use a complete http:// or https:// source URL, or leave it empty."),
  })
  .strict();

const text = z.string().min(1).max(2500);
export const generationSchema = z
  .object({
    priority: z.enum(["Explore", "Research further", "Deprioritize"]),
    rationale: text,
    evidence: z
      .array(z.object({ quote: text, relevance: text }).strict())
      .max(5),
    hypothesis: text,
    blockers: z.array(text).min(1).max(5),
    unknowns: z.array(text).min(1).max(8),
    useCase: z
      .object({
        title: text,
        problem: text,
        buyer: text,
        valueHypothesis: text,
        questions: z.array(text).length(3),
        pilot: text,
      })
      .strict(),
    outreach: z
      .object({
        subject: z.string().min(1).max(180),
        body: z.string().min(1).max(3000),
      })
      .strict(),
  })
  .strict();

export type Account = z.infer<typeof accountSchema>;
export type Generation = z.infer<typeof generationSchema>;
export type Draft = Generation["outreach"];
export type Mode = "sample" | "live";
export const emptyAccount: Account = {
  company: "",
  market: "",
  industry: "",
  description: "",
  notes: "",
  url: "",
};
export const wordCount = (value: string) =>
  value.trim() ? value.trim().split(/\s+/).length : 0;

// Evidence quotes must actually occur in the notes. Never render unsupported quotes.
export function validateGeneration(
  value: unknown,
  account: Account,
): Generation {
  const parsed = generationSchema.parse(value);
  if (parsed.evidence.some((item) => !account.notes.includes(item.quote))) {
    throw new Error(
      "The response included evidence that could not be found in your source notes. Please try again.",
    );
  }
  const words = wordCount(parsed.outreach.body);
  if (words < 80 || words > 120)
    throw new Error(
      "The response did not meet the 80–120 word draft requirement. Please try again.",
    );
  if (!parsed.evidence.length && parsed.priority !== "Research further") {
    throw new Error(
      "The response assigned a priority without supporting source evidence. Please add research or try again.",
    );
  }
  return parsed;
}
