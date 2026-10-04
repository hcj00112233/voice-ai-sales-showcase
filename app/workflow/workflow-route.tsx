"use client";

import { useSearchParams } from "next/navigation";
import Workspace from "@/components/workspace";

export default function WorkflowRoute() {
  const scenario = useSearchParams().get("scenario");
  const aliases: Record<string, string> = {
    learning: "lisan",
    localization: "sahab",
    care: "bayt",
  };
  const selected = scenario ? (aliases[scenario] ?? scenario) : undefined;
  return <Workspace key={selected ?? "blank"} initialSampleId={selected} />;
}
