"use client";

import type { Letter } from "@/types/session";

interface CalibrationPanelProps {
  currentLetter: Letter | undefined;
  currentLetterIndex: number;
  totalLetters: number;
  samplesForLetter: number;
  samplesPerLetter: number;
  dwellProgress: number;
}

export function CalibrationPanel({
  currentLetter,
  currentLetterIndex,
  totalLetters,
  samplesForLetter,
  samplesPerLetter,
  dwellProgress,
}: CalibrationPanelProps) {
  const overallProgress = (currentLetterIndex + samplesForLetter / samplesPerLetter) / totalLetters;

  return (
    <div className="fade-up rounded-2xl border border-border bg-surface-card p-6">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          Calibrating your hand
        </span>
        <span className="font-mono text-[11px] text-ink-muted">
          {currentLetterIndex + 1} / {totalLetters}
        </span>
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
              stroke="var(--series-1)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - dwellProgress)}
              style={{ transition: "stroke-dashoffset 60ms linear" }}
            />
          </svg>
          <span className="font-mono text-4xl font-bold text-ink-primary">{currentLetter ?? "—"}</span>
        </div>

        <div className="flex-1">
          <p className="text-sm text-ink-secondary">
            Hold the shape for <span className="text-ink-primary">{currentLetter ?? "this letter"}</span> steady
            until the ring fills.
          </p>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: samplesPerLetter }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i < samplesForLetter ? "var(--series-1)" : "var(--gridline)" }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gridline">
          <div
            className="h-full rounded-full bg-series-1"
            style={{ width: `${Math.round(overallProgress * 100)}%`, transition: "width 200ms ease" }}
          />
        </div>
      </div>
    </div>
  );
}
