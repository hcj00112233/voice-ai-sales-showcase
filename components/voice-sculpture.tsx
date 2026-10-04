"use client";

import { useEffect, useRef, useState } from "react";
import type { SculptureController, VoiceScene } from "./voice-sculpture-engine";

export default function VoiceSculpture({ scene }: { scene: VoiceScene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<SculptureController | null>(null);
  const sceneRef = useRef(scene);
  const [ready, setReady] = useState(false);
  sceneRef.current = scene;

  useEffect(() => {
    let disposed = false;
    import("./voice-sculpture-engine")
      .then(({ mountSculpture }) => {
        if (disposed || !canvasRef.current) return;
        try {
          controller.current = mountSculpture(
            canvasRef.current,
            sceneRef.current,
            (value) => {
              if (!disposed) setReady(value);
            },
          );
        } catch {
          if (!disposed) setReady(false);
        }
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });
    return () => {
      disposed = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    controller.current?.setScene(scene);
  }, [scene]);

  return (
    <div
      className={`sculpture sculpture-${scene}${ready ? " has-webgl" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="sculpture-canvas" />
      <svg
        className="sculpture-fallback"
        viewBox="0 0 800 600"
        role="presentation"
      >
        <defs>
          <linearGradient id="silver" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#202936" />
            <stop offset=".2" stopColor="#f8fbff" />
            <stop offset=".37" stopColor="#626b75" />
            <stop offset=".53" stopColor="#fff" />
            <stop offset=".73" stopColor="#3e4855" />
            <stop offset=".86" stopColor="#ecf2fa" />
            <stop offset="1" stopColor="#353d48" />
          </linearGradient>
        </defs>
        {Array.from({ length: 30 }, (_, i) => {
          const band = Math.floor(i / 10),
            local = i % 10;
          return (
            <g key={i} fill="none" stroke="url(#silver)" strokeWidth="4.4">
              {scene === "learning" && (
                <ellipse
                  cx={400 + i * 0.65}
                  cy={236 + i * 2.2}
                  rx={142 + i * 0.55}
                  ry={158}
                  transform="rotate(-22 400 280)"
                />
              )}
              {scene === "localization" && (
                <path
                  d={`M120 ${145 + band * 96 + local * 3} C290 ${-5 + band * 96 + local * 3} 445 ${385 + band * 96 + local * 3} 700 ${220 + band * 96 + local * 3}`}
                />
              )}
              {scene === "care" && (
                <path
                  d={
                    i < 15
                      ? `M337 ${148 + i * 3} C75 ${-20 + i * 3} 70 ${505 + i * 3} 333 ${355 + i * 3}`
                      : `M465 ${178 + (i - 15) * 3} C735 ${50 + (i - 15) * 3} 725 ${555 + (i - 15) * 3} 465 ${382 + (i - 15) * 3}`
                  }
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
