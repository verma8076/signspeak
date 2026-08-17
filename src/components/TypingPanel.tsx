"use client";

import type { ClassificationResult } from "@/types/session";

interface TypingPanelProps {
  textBuffer: string;
  classification: ClassificationResult;
  dwellProgress: number;
  onSpace: () => void;
  onBackspace: () => void;
  onClear: () => void;
}

export function TypingPanel({ textBuffer, classification, dwellProgress, onSpace, onBackspace, onClear }: TypingPanelProps) {
  return (
    <div className="fade-up flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">Typed text</span>
          <button
            onClick={onClear}
            className="text-[11px] font-medium text-ink-muted transition-colors hover:text-ink-primary"
          >
            Clear
          </button>
        </div>
        <p className="mt-3 min-h-[3.5rem] break-words font-mono text-2xl text-ink-primary">
          {textBuffer || <span className="text-ink-muted">Start signing letters…</span>}
          <span className="animate-pulse text-series-1">|</span>
        </p>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-border bg-surface-card p-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gridline)" strokeWidth="9" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--series-1)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - dwellProgress)}
              style={{ transition: "stroke-dashoffset 60ms linear" }}
            />
          </svg>
          <span className="font-mono text-xl font-bold text-ink-primary">{classification.letter ?? "·"}</span>
        </div>
        <div>
          <p className="text-sm text-ink-secondary">
            {classification.letter
              ? "Hold steady to type this letter."
              : "Form a letter shape clearly in frame."}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            confidence {Math.round(classification.confidence * 100)}%
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSpace}
          className="flex-1 rounded-xl border border-border bg-surface-card py-3 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-raised"
        >
          Space
        </button>
        <button
          onClick={onBackspace}
          className="flex-1 rounded-xl border border-border bg-surface-card py-3 text-sm font-medium text-ink-primary transition-colors hover:bg-surface-raised"
        >
          Backspace
        </button>
      </div>
    </div>
  );
}
