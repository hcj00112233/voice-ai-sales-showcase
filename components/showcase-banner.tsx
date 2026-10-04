import type { ReactNode } from "react";
import { ArrowDown } from "@phosphor-icons/react";

/** Hosts the interactive hero within the existing showcase page layout. */
export default function ShowcaseBanner({
  children,
  id = "showcase-intro",
  className = "",
}: {
  children?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`collection-banner ${className}`}
      aria-label="Voice AI showcase introduction"
    >
      {children ?? (
        <div className="collection-container collection-banner-content">
          <p>Independent portfolio / Voice AI</p>
          <h1>
            Hear the idea.
            <br />
            <span>Explore the opportunity.</span>
          </h1>
          <a href="#demo">
            Explore the collection <ArrowDown size={18} />
          </a>
        </div>
      )}
    </section>
  );
}
