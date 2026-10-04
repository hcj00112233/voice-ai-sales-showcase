"use client";

import { useSearchParams } from "next/navigation";
import Showcase from "@/components/showcase";

export default function ShowcaseRoute() {
  const scenario = useSearchParams().get("scenario");
  const aliases: Record<string, string> = {
    learning: "lisan",
    localization: "sahab",
    care: "bayt",
  };
  const selected = scenario ? (aliases[scenario] ?? scenario) : "lisan";
  return <Showcase key={selected} initialScene={selected} />;
}
