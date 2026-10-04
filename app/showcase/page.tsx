import { Suspense } from "react";
import ShowcaseRoute from "./showcase-route";
import "../collection.css";

export default function ShowcasePage() {
  return <Suspense fallback={null}><ShowcaseRoute /></Suspense>;
}
