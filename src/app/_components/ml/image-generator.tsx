"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface ImageGeneratorProps {
  className?: string;
}

export function ImageGenerator({ className = "" }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const generateImage = api.ml.generateImage.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedImages(result.data);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    generateImage.mutate({
      prompt: prompt.trim(),
      negative_prompt: negativePrompt.trim() || undefined,
    });
  };

  return (
    <div className={`rounded-xl bg-gray-900 border border-gray-800 p-6 ${className}`}>
      <h2 className="mb-4 text-2xl font-bold text-white">AI Image Generator</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Describe the image you want to generate
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A beautiful sunset over mountains, digital art style..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-600 focus:outline-none"
            rows={3}
            maxLength={1000}
          />
          <div className="mt-1 text-xs text-gray-400">
            {prompt.length}/1000 characters
          </div>
        </div>

        <div>
          <label
            htmlFor="negative-prompt"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            What to avoid (optional)
          </label>
          <input
            id="negative-prompt"
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, low quality, distorted..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-600 focus:outline-none"
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || generateImage.isPending}
          className="w-full rounded-lg bg-white text-black px-4 py-2 font-semibold transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generateImage.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Generating...
            </div>
          ) : (
            "Generate Image"
          )}
        </button>
      </form>

      {generateImage.error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
          <p className="text-sm text-red-200">
            Error: {generateImage.error.message}
          </p>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Generated Images
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="group relative">
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full rounded-lg shadow-lg transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/20 px-3 py-1 text-sm text-white transition-colors hover:bg-white/30"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
