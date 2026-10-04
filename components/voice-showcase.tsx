"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import VoiceSculpture from "./voice-sculpture";

type Scene = "learning" | "localization" | "care";
const scenarioAliases: Record<Scene, string> = {
  learning: "lisan",
  localization: "sahab",
  care: "bayt",
};
const scenes: {
  id: Scene;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "learning",
    label: "Learning",
    title: "Explore multilingual listening experiences.",
    description: "",
  },
  {
    id: "localization",
    label: "Localization",
    title: "One story. More ways to hear it.",
    description: "Explore multilingual content with a consistent voice.",
  },
  {
    id: "care",
    label: "Customer care",
    title: "A conversation that moves things forward.",
    description: "Explore an order inquiry and a clear human handoff.",
  },
];

export default function VoiceShowcase({
  embedded = false,
  initialScene = "learning",
  scene: controlledScene,
  onSceneChange,
}: {
  embedded?: boolean;
  initialScene?: Scene;
  scene?: Scene;
  onSceneChange?: (scene: Scene) => void;
}) {
  const [localScene, setLocalScene] = useState<Scene>(initialScene);
  const scene = controlledScene ?? localScene;
  const [captionScene, setCaptionScene] = useState<Scene>(initialScene);
  const [aboutOpen, setAboutOpen] = useState(false);
  const activeScene =
    scenes.find((item) => item.id === captionScene) ?? scenes[0];
  const demoHref = useMemo(
    () => `/showcase?scenario=${scenarioAliases[scene]}#demo-experience`,
    [scene],
  );
  const workflowHref = useMemo(
    () => `/workflow?scenario=${scenarioAliases[scene]}`,
    [scene],
  );

  useEffect(() => {
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 180
      : 1030;
    const timeout = window.setTimeout(() => setCaptionScene(scene), delay);
    return () => window.clearTimeout(timeout);
  }, [scene]);

  function handleSceneKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % scenes.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index + scenes.length - 1) % scenes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = scenes.length - 1;
    else return;
    event.preventDefault();
    chooseScene(scenes[next].id);
    document
      .querySelector<HTMLButtonElement>(`[data-scene="${scenes[next].id}"]`)
      ?.focus();
  }

  function chooseScene(next: Scene) {
    if (!controlledScene) setLocalScene(next);
    onSceneChange?.(next);
  }

  const hero = (
    <section
      className={
        embedded ? "showcase-hero showcase-hero-embedded" : "showcase-hero"
      }
      aria-labelledby="hero-title"
    >
      <div className="hero-copy">
        <h1 id="hero-title">
          Hear what’s possible.
          <br />
          <span>See why it matters.</span>
        </h1>
        <p className="hero-description">
          Explore how voice AI could support learning, localization, and
          customer conversations across MENA.
        </p>

        <div
          className="scene-picker"
          role="tablist"
          aria-label="Choose a voice AI scenario"
        >
          {scenes.map((item, index) => (
            <button
              key={item.id}
              id={`scene-tab-${item.id}`}
              data-scene={item.id}
              role="tab"
              type="button"
              aria-selected={scene === item.id}
              aria-controls="scene-display"
              tabIndex={scene === item.id ? 0 : -1}
              className={
                scene === item.id ? "scene-tab is-selected" : "scene-tab"
              }
              onClick={() => chooseScene(item.id)}
              onKeyDown={(event) => handleSceneKey(event, index)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hero-actions">
          <Link className="primary-cta" href={demoHref}>
            Explore the demo <span aria-hidden="true">↗</span>
          </Link>
          <Link className="secondary-cta" href={workflowHref}>
            See the workflow
          </Link>
        </div>
        <p className="action-note">Choose a scene to shape the experience.</p>
      </div>

      <div
        className="hero-stage"
        id="scene-display"
        role="tabpanel"
        aria-labelledby={`scene-tab-${scene}`}
      >
        <VoiceSculpture scene={scene} />
        <div className="stage-caption" aria-live="polite" aria-atomic="true">
          <h2 key={`title-${captionScene}`}>{activeScene.title}</h2>
          {activeScene.description && (
            <p key={`description-${captionScene}`}>{activeScene.description}</p>
          )}
        </div>
        <span className="stage-axis" aria-hidden="true">
          VOICE, SHAPED FOR USE
        </span>
      </div>
    </section>
  );

  if (embedded) {
    return <div className="showcase-shell showcase-shell-embedded">{hero}</div>;
  }

  return (
    <main className="showcase-shell">
      <header className="showcase-header">
        <Link
          className="showcase-wordmark"
          href="/"
          aria-label="Voice AI Sales Showcase home"
        >
          <span>Voice AI</span>
          <span aria-hidden="true">/</span>
          <span>Sales Showcase</span>
        </Link>
        <nav className="header-links" aria-label="Main navigation">
          <button type="button" onClick={() => setAboutOpen(true)}>
            About this project
          </button>
          <Link href={demoHref}>
            Explore the demo <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>
      {hero}

      {aboutOpen && (
        <div
          className="about-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAboutOpen(false);
          }}
        >
          <section
            className="about-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
          >
            <button
              className="about-close"
              type="button"
              onClick={() => setAboutOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 id="about-title">Voice, made useful.</h2>
            <p>
              A personal exploration of how expressive voice AI can make
              learning, localization, and customer conversations more human
              across MENA.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
