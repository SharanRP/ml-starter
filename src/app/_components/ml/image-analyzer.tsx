"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";

interface ImageAnalyzerProps {
  className?: string;
}

export function ImageAnalyzer({ className = "" }: ImageAnalyzerProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [, setImageFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = api.ml.analyzeImage.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setAnalysis(result.data);
      }
    },
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setPreviewUrl(imageUrl);
    analyzeImage.mutate({
      image: imageUrl.trim(),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // Analyze the image
      analyzeImage.mutate({
        image: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImageUrl("");
    setImageFile(null);
    setAnalysis("");
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`rounded-xl bg-white/10 p-6 ${className}`}>
      <h2 className="mb-4 text-2xl font-bold text-white">AI Image Analyzer</h2>

      <div className="space-y-6">
        {/* URL Input */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">
            Option 1: Image URL
          </h3>
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!imageUrl.trim() || analyzeImage.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 font-semibold text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Analyze from URL
            </button>
          </form>
        </div>

        {/* File Upload */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">
            Option 2: Upload Image
          </h3>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-white file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
            />
            <p className="text-xs text-white/60">
              Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>
        </div>

        {/* Clear Button */}
        {(previewUrl || analysis) && (
          <button
            onClick={handleClear}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Loading State */}
      {analyzeImage.isPending && (
        <div className="mt-6 flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-white">Analyzing image...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {analyzeImage.error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
          <p className="text-sm text-red-200">
            Error: {analyzeImage.error.message}
          </p>
        </div>
      )}

      {/* Results */}
      {(previewUrl || analysis) && (
        <div className="mt-6 space-y-4">
          {previewUrl && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Image Preview
              </h3>
              <div className="relative mx-auto max-w-md">
                <img
                  src={previewUrl}
                  alt="Image to analyze"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}

          {analysis && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Analysis Result
              </h3>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="leading-relaxed text-white/90">{analysis}</p>
                <div className="mt-3 flex justify-end border-t border-white/10 pt-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(analysis)}
                    className="rounded bg-white/10 px-2 py-1 text-xs text-white transition-colors hover:bg-white/20"
                  >
                    Copy Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
