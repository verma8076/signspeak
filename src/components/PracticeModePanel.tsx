"use client";

import type { ClassificationResult, Letter } from "@/types/session";
import type { PracticeFeedback, PracticeScore } from "@/session/useSignSession";

interface PracticeModePanelProps {
  target: Letter | null;
  classification: ClassificationResult;
  dwellProgress: number;
  score: PracticeScore;
  feedback: PracticeFeedback;
  onExit: () => void;
}

export function PracticeModePanel({
  target,
  classification,
  dwellProgress,
  score,
  feedback,
  onExit,
}: PracticeModePanelProps) {
  const ringColor = feedback === "correct" ? "var(--status-good)" : feedback === "incorrect" ? "var(--status-critical)" : "var(--series-1)";
  const accuracy = score.attempts > 0 ? Math.round((score.correct / score.attempts) * 100) : null;

  return (
    <div className="fade-up flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface-card p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Practice mode</span>
          <button
            onClick={onExit}
            className="text-[11px] font-medium text-ink-muted transition-colors hover:text-ink-primary"
          >
            Exit practice
          </button>
        </div>

        <div className="mt-5 flex items-center gap-6">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gridline)" strokeWidth="7" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={ringColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - dwellProgress)}
                style={{ transition: "stroke-dashoffset 60ms linear, stroke 150ms ease" }}
              />
            </svg>
            <span className="font-mono text-4xl font-bold text-ink-primary">{target ?? "—"}</span>
          </div>

          <div className="flex-1">
            <p className="text-sm text-ink-secondary">
              Sign the letter <span className="text-ink-primary">{target ?? "shown"}</span>.
            </p>
            <p className="mt-1.5 min-h-[1.25rem] text-sm font-medium" style={{ color: ringColor }}>
              {feedback === "correct" && "Correct!"}
              {feedback === "incorrect" && "Not quite — try again."}
              {feedback === null && " "}
            </p>
            <p className="mt-1 font-mono text-[11px] text-ink-muted">
              currently reading {classification.letter ?? "—"} · confidence {Math.round(classification.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Score</span>
          <span className="font-mono text-sm text-ink-primary">
            {score.correct} / {score.attempts}
            {accuracy !== null && <span className="ml-2 text-ink-muted">({accuracy}%)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
