"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface TextSummarizerProps {
  className?: string;
}

export function TextSummarizer({ className = "" }: TextSummarizerProps) {
  const [text, setText] = useState("");
  const [maxLength, setMaxLength] = useState(150);
  const [summary, setSummary] = useState("");

  const summarizeText = api.ml.summarizeText.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setSummary(result.data);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    summarizeText.mutate({
      text: text.trim(),
      max_length: maxLength,
    });
  };

  const handleClear = () => {
    setText("");
    setSummary("");
  };

  return (
    <div className={`rounded-xl bg-gray-900 border border-gray-800 p-6 ${className}`}>
      <h2 className="mb-4 text-2xl font-bold text-white">AI Text Summarizer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="text-input"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Enter text to summarize
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, document, or any long text here..."
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
            rows={8}
            maxLength={10000}
          />
          <div className="mt-1 flex justify-between text-xs text-white/60">
            <span>{text.length}/10,000 characters</span>
            <span>Minimum: 10 characters</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="max-length"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Summary length: {maxLength} words
          </label>
          <input
            id="max-length"
            type="range"
            min="50"
            max="500"
            step="25"
            value={maxLength}
            onChange={(e) => setMaxLength(Number(e.target.value))}
            className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/20"
          />
          <div className="mt-1 flex justify-between text-xs text-white/60">
            <span>50 words</span>
            <span>500 words</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={text.length < 10 || summarizeText.isPending}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 font-semibold text-white transition-all hover:from-blue-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {summarizeText.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Summarizing...
              </div>
            ) : (
              "Summarize Text"
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
          >
            Clear
          </button>
        </div>
      </form>

      {summarizeText.error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
          <p className="text-sm text-red-200">
            Error: {summarizeText.error.message}
          </p>
        </div>
      )}

      {summary && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-white">Summary</h3>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="leading-relaxed text-white/90">{summary}</p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/60">
                Original: {text.length} chars • Summary: {summary.length} chars
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(summary)}
                className="rounded bg-white/10 px-2 py-1 text-xs text-white transition-colors hover:bg-white/20"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
