"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Play,
  Stop,
  Waveform,
  BookOpen,
  Translate,
  Headphones,
  Check,
  GitBranch,
} from "@phosphor-icons/react";
import { samples } from "@/lib/samples";
import { showcaseScenes } from "@/lib/showcase";
import WorkflowMap from "./workflow-map";
import ShowcaseBanner from "./showcase-banner";
import VoiceShowcase from "./voice-showcase";

const icons = [BookOpen, Translate, Headphones];

export default function Showcase({
  initialScene = "lisan",
}: {
  initialScene?: string;
}) {
  const [sceneIndex, setSceneIndex] = useState(
    Math.max(
      0,
      showcaseScenes.findIndex((scene) => scene.id === initialScene),
    ),
  );
  const [step, setStep] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [audioNotice, setAudioNotice] = useState("");
  const speechVersion = useRef(0);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapDialog = useRef<HTMLDialogElement>(null);
  const transcript = useRef<HTMLDetailsElement>(null);
  const scene = showcaseScenes[sceneIndex];
  const sample = samples.find((item) => item.id === scene.id)!;
  const current = scene.steps[step];
  const availableVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );
  const workflowHref = `/workflow?scenario=${scene.id}`;
  const heroScene =
    scene.id === "lisan"
      ? "learning"
      : scene.id === "sahab"
        ? "localization"
        : "care";

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const sync = () => setVoices(window.speechSynthesis.getVoices());
    sync();
    window.speechSynthesis.addEventListener("voiceschanged", sync);
    return () => {
      speechVersion.current++;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", sync);
      if (watchdog.current) clearTimeout(watchdog.current);
    };
  }, []);

  function stopAudio() {
    speechVersion.current++;
    if (watchdog.current) clearTimeout(watchdog.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setAudioNotice("");
  }

  function listen() {
    if (playing) {
      stopAudio();
      return;
    }
    if (!availableVoice || !("speechSynthesis" in window)) {
      setAudioNotice(
        "No English device voice is available in this browser. You can still explore every script below.",
      );
      return;
    }
    stopAudio();
    const version = speechVersion.current;
    const utterance = new SpeechSynthesisUtterance(current.en);
    utterance.voice = availableVoice;
    utterance.lang = availableVoice.lang;
    utterance.rate = 0.92;
    setAudioNotice("Preparing device voice…");
    // Some embedded browsers expose voices but never fire start/error events.
    watchdog.current = setTimeout(() => {
      if (version !== speechVersion.current) return;
      stopAudio();
      setAudioNotice(
        "Audio did not start. Try another browser, or continue with the script.",
      );
    }, 8000);
    utterance.onstart = () => {
      if (version !== speechVersion.current) return;
      if (watchdog.current) clearTimeout(watchdog.current);
      setPlaying(true);
      setAudioNotice("Playing device voice. This is not ElevenLabs audio.");
    };
    utterance.onend = () => {
      if (version !== speechVersion.current) return;
      if (watchdog.current) clearTimeout(watchdog.current);
      setPlaying(false);
      setAudioNotice("Preview finished. Replay or explore the next moment.");
    };
    utterance.onerror = () => {
      if (version !== speechVersion.current) return;
      if (watchdog.current) clearTimeout(watchdog.current);
      setPlaying(false);
      setAudioNotice(
        "This browser could not play the device voice. The full script is available below.",
      );
    };
    window.speechSynthesis.speak(utterance);
  }

  function selectScene(index: number) {
    stopAudio();
    setSceneIndex(index);
    setStep(0);
  }
  function selectStep(index: number) {
    stopAudio();
    setStep(index);
  }

  return (
    <div className="collection-shell">
      <a href="#demo-experience" className="skip-link">
        Skip to demo
      </a>
      <header className="collection-header">
        <Link
          href="/"
          className="collection-brand"
          aria-label="Voice AI showcase home"
        >
          <Waveform size={29} weight="bold" />
          <span>
            Voice AI <span> / Sales showcase</span>
          </span>
        </Link>
        <nav aria-label="Showcase navigation">
          <a href="#sales-thinking">About this project</a>
          <a href="#demo-experience">
            Explore the demo <ArrowUpRight size={16} />
          </a>
        </nav>
      </header>

      <main>
        <ShowcaseBanner id="demo" className="collection-banner-hero">
          <VoiceShowcase
            embedded
            initialScene={heroScene}
            scene={heroScene}
            onSceneChange={(next) => {
              const alias =
                next === "learning"
                  ? "lisan"
                  : next === "localization"
                    ? "sahab"
                    : "bayt";
              const nextIndex = showcaseScenes.findIndex((item) => item.id === alias);
              if (nextIndex >= 0) selectScene(nextIndex);
            }}
          />
        </ShowcaseBanner>
        <section
          id="demo-experience"
          className="collection-demo collection-container"
          aria-labelledby="demo-heading"
        >
          <div className="collection-section-heading">
            <p className="collection-kicker">The demo collection</p>
            <h2 id="demo-heading">Put a use case in motion.</h2>
            <p>
              Three MENA scenarios. Explore the experience, then the thinking
              behind the opportunity.
            </p>
          </div>
          <div
            className="collection-selector"
            role="group"
            aria-label="Choose a scenario"
          >
            {showcaseScenes.map((item, index) => {
              const Icon = icons[index];
              return (
                <button
                  key={item.id}
                  aria-pressed={index === sceneIndex}
                  onClick={() => selectScene(index)}
                >
                  <Icon
                    size={21}
                    weight={index === sceneIndex ? "fill" : "regular"}
                  />
                  <span>{item.label}</span>
                  <ArrowUpRight size={17} />
                </button>
              );
            })}
          </div>

          <div className="collection-stage">
            <div className="collection-player">
              <div className="collection-player-top">
                <span>Script preview</span>
                <span className="collection-language-label">
                  English preview
                </span>
              </div>
              <div
                className={`collection-voice-art scene-${scene.id} ${playing ? "is-speaking" : ""}`}
                aria-hidden="true"
              >
                {Array.from({ length: 49 }, (_, index) => (
                  <i
                    key={index}
                    style={
                      {
                        "--bar": index,
                        "--height": `${18 + Math.pow(Math.sin(index * 0.37), 2) * (95 - Math.abs(index - 24) * 2.8)}%`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <div className="collection-script" key={`${scene.id}-${step}`}>
                <span>{current.speaker}</span>
                <p lang="en">{current.en}</p>
              </div>
              <div className="collection-player-bottom">
                <button className="collection-listen" onClick={listen}>
                  {playing ? (
                    <Stop size={16} weight="fill" />
                  ) : (
                    <Play size={16} weight="fill" />
                  )}
                  {playing ? "Stop preview" : "Listen with device voice"}
                </button>
                <span>
                  {step + 1} / {scene.steps.length}
                </span>
              </div>
              <p className="collection-audio-note">
                Device speech preview · Not ElevenLabs audio
              </p>
            </div>
            <aside className="collection-story" aria-label="Scenario context">
              <div className="collection-account">
                <span>{sample.account.market}</span>
                <span>Fictional account</span>
              </div>
              <div className="collection-story-intro" key={scene.id}>
                <p>{sample.account.company}</p>
                <h2>{scene.title}</h2>
                <p>{scene.description}</p>
              </div>
              <div
                className="collection-moments"
                role="group"
                aria-label="Explore script moments"
              >
                {scene.steps.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => selectStep(index)}
                    aria-pressed={step === index}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                    {step === index && <ArrowRight size={17} />}
                  </button>
                ))}
              </div>
              <div className="collection-insight">
                <span>What this moment shows</span>
                <p>{current.insight}</p>
              </div>
              <div className="collection-story-controls">
                <button
                  onClick={() => selectStep(step - 1)}
                  disabled={step === 0}
                  aria-label="Previous moment"
                >
                  <ArrowLeft size={19} />
                </button>
                <button onClick={() => selectStep(step === 2 ? 0 : step + 1)}>
                  {step === 2 ? "Restart scenario" : "Next moment"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </aside>
          </div>
          <div className="collection-preview-foot">
            <p role="status">
              {audioNotice ||
                "Authored concept scripts. No live agent, microphone, or customer data."}
            </p>
            <a
              href="#full-script"
              onClick={() => {
                if (transcript.current) transcript.current.open = true;
              }}
            >
              Read the full script <ArrowRight size={15} />
            </a>
          </div>
          <details
            ref={transcript}
            id="full-script"
            className="collection-transcript"
          >
            <summary>
              Full English script <span>3 moments</span>
            </summary>
            <ol>
              {scene.steps.map((item) => (
                <li key={item.label}>
                  <span>
                    {item.label} · {item.speaker}
                  </span>
                  <p lang="en">{item.en}</p>
                </li>
              ))}
            </ol>
          </details>
        </section>

        <section
          id="sales-thinking"
          className="collection-judgment collection-container"
          aria-labelledby="thinking-heading"
        >
          <div className="collection-section-heading">
            <h2 id="thinking-heading">A good demo opens a question.</h2>
            <p>
              Here’s how I would decide whether {sample.account.company} is
              worth a discovery conversation.
            </p>
          </div>
          <div className="collection-evidence-layout">
            <div className="collection-evidence">
              <span className="collection-small-label">The signal</span>
              <blockquote>
                “{sample.output.evidence[scene.id === "lisan" ? 1 : 0].quote}”
              </blockquote>
              <p>From the fictional account brief</p>
              <details>
                <summary>Read the source notes</summary>
                <p>{sample.account.notes}</p>
              </details>
            </div>
            <div className="collection-verdict">
              <span className="collection-priority">
                <span aria-hidden="true">↗</span>
                {sample.output.priority}
              </span>
              <h3>
                {scene.id === "bayt"
                  ? "Validate the need first."
                  : "Relevant enough to explore."}
              </h3>
              <p>{sample.output.rationale}</p>
              <div>
                <span>Suggested buyer</span>
                <strong>{sample.output.useCase.buyer}</strong>
              </div>
            </div>
          </div>
          <div className="collection-value-grid">
            <article>
              <span className="collection-small-label">
                The value hypothesis
              </span>
              <h3>{scene.outcome}</h3>
              <p>{sample.output.hypothesis}</p>
            </article>
            <article>
              <span className="collection-small-label">The boundary</span>
              <h3>
                {scene.id === "bayt"
                  ? "No evidence of demand. Yet."
                  : "Quality still needs a human."}
              </h3>
              <p>{scene.boundary}</p>
            </article>
          </div>
        </section>

        <section
          className="collection-discovery collection-container"
          aria-labelledby="discovery-heading"
        >
          <div>
            <h2 id="discovery-heading">What I’d ask next.</h2>
            <p>
              Start with their process.
              <br />
              Earn the right to propose a pilot.
            </p>
            <span>For {sample.output.useCase.buyer}</span>
          </div>
          <div className="collection-questions">
            {sample.output.useCase.questions.map((question, index) => (
              <details key={question}>
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {question}
                  <span className="collection-expand" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>
                  {index === 0
                    ? `Listen for the current workflow, its owner, and whether a problem actually exists. ${sample.output.unknowns[0]}`
                    : index === 1
                      ? sample.output.blockers[0]
                      : "Agree what would count as a useful result before proposing scope, timing, or a larger rollout."}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section
          className="collection-pilot collection-container"
          aria-labelledby="pilot-heading"
        >
          <div className="collection-pilot-card">
            <div>
              <span className="collection-small-label">
                A focused first experiment
              </span>
              <h2 id="pilot-heading">
                Small scope.
                <br />A useful answer.
              </h2>
            </div>
            <div>
              <h3>{sample.output.useCase.title}</h3>
              <p>{sample.output.useCase.pilot}</p>
              <div className="collection-measure">
                <Check size={21} />
                <div>
                  <strong>What I would evaluate</strong>
                  <p>{scene.pilotMeasure}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="collection-workflow collection-container"
          aria-labelledby="workflow-heading"
        >
          <div className="collection-workflow-copy">
            <GitBranch size={29} />
            <h2 id="workflow-heading">
              From a promising idea
              <br />
              to a prepared conversation.
            </h2>
            <p>
              Take this account into the workspace. Inspect the evidence, shape
              the outreach, and review the handoff yourself.
            </p>
            <Link
              className="collection-primary"
              href={workflowHref}
              onClick={stopAudio}
            >
              Explore the workflow <ArrowUpRight size={18} />
            </Link>
            <p className="collection-workflow-hint">
              {sample.account.company} will be loaded for you.
            </p>
          </div>
          <div className="collection-workflow-path">
            <ol>
              {[
                "Account brief",
                "Fit & evidence",
                "Voice AI use case",
                "Outreach draft",
                "Review & AE handoff",
              ].map((label, i) => (
                <li key={label}>
                  <span>{i + 1}</span>
                  {label}
                  {i === 4 && (
                    <span className="collection-human">Human review</span>
                  )}
                </li>
              ))}
            </ol>
            <button onClick={() => mapDialog.current?.showModal()}>
              View the workflow map <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </main>
      <footer className="collection-footer collection-container">
        <span>
          <Waveform size={22} /> Voice AI / Sales showcase
        </span>
        <p>
          Fictional scenarios.
          <br />
          Not an official ElevenLabs product.
        </p>
        <a href="#demo">Back to the collection ↑</a>
      </footer>
      <WorkflowMap dialogRef={mapDialog} />
    </div>
  );
}
