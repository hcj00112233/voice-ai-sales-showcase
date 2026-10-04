"use client";
import { DownloadSimple, X, ArrowUpRight } from "@phosphor-icons/react";
import type { RefObject } from "react";
import { sitePath } from "@/lib/site";

export default function WorkflowMap({
  dialogRef,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="workflow-map-dialog"
      aria-labelledby="workflow-map-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="dialog-header">
        <div>
          <span className="section-kicker">THE PREPARATION LOGIC</span>
          <h2 id="workflow-map-title">A clear path. A human decision.</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close workflow map"
          onClick={() => dialogRef.current?.close()}
        >
          <X size={21} />
        </button>
      </div>
      <p>
        Follow the source evidence through to a reviewed preparation package.
        Editing the research or the email reopens the relevant review.
      </p>
      <p className="map-scroll-hint">
        Scroll sideways to follow the full workflow, or read the text version
        below.
      </p>
      <div
        className="workflow-map-image"
        tabIndex={0}
        role="region"
        aria-label="Scrollable workflow diagram"
      >
        <img
          src={sitePath("/diagrams/workflow.svg")}
          width="1160"
          height="620"
          alt="Five stages flow from Account Brief to Fit and Evidence, Voice AI Use Case, Outreach Draft, and a three-check human review gate. Approval produces a reviewed Markdown or JSON package with Discovery pending status. Source edits require regeneration; outreach edits remove approval."
        />
      </div>
      <div className="map-caption">
        <p>
          Approval records preparation review only. It does not imply a reply,
          qualification, or meeting.
        </p>
        <div>
          <a
            className="secondary"
            href={sitePath("/diagrams/workflow.svg")}
            target="_blank"
            rel="noreferrer"
          >
            Open full size
            <ArrowUpRight size={15} />
          </a>
          <a
            className="secondary"
            href={sitePath("/diagrams/workflow.excalidraw")}
            download
          >
            <DownloadSimple size={15} />
            Editable Excalidraw
          </a>
        </div>
      </div>
      <details className="map-text">
        <summary>Read the workflow as text</summary>
        <ol>
          <li>
            Account Brief: enter company context, source notes, and an optional
            URL.
          </li>
          <li>
            Fit & Evidence: inspect priority, direct quotes, hypotheses,
            blockers, and unknowns.
          </li>
          <li>
            Voice AI Use Case: explore one use case, three discovery questions,
            and pilot criteria.
          </li>
          <li>Outreach Draft: edit the email. No email is sent.</li>
          <li>
            Review & AE Handoff: check the evidence, hypothesis, and draft
            before approval. Exports before approval are labeled Unreviewed
            draft; commercial status stays Discovery pending.
          </li>
        </ol>
      </details>
    </dialog>
  );
}
