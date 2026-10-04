import { Suspense } from "react";
import WorkflowRoute from "./workflow-route";

export default function WorkflowPage() {
  return <Suspense fallback={null}><WorkflowRoute /></Suspense>;
}
