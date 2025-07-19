"use client";

import { api } from "~/trpc/react";

interface RateLimitDisplayProps {
  className?: string;
}

export function RateLimitDisplay({ className = "" }: RateLimitDisplayProps) {
  const { data: rateLimit, isLoading } = api.ml.getRateLimit.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  );

  if (isLoading || !rateLimit) {
    return (
      <div className={`rounded-lg bg-white/5 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-32 rounded bg-white/10"></div>
          <div className="h-3 w-24 rounded bg-white/10"></div>
        </div>
      </div>
    );
  }

  const limits = [
    {
      name: "Image Generation",
      current: rateLimit.imageGeneration,
      max: 5,
      color: "purple",
    },
    {
      name: "Text Summarization",
      current: rateLimit.textSummarization,
      max: 10,
      color: "blue",
    },
    {
      name: "Image Analysis",
      current: rateLimit.imageAnalysis,
      max: 8,
      color: "green",
    },
    {
      name: "Image Enhancement",
      current: rateLimit.imageEnhancement,
      max: 3,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string, percentage: number) => {
    const isLow = percentage < 0.3;

    switch (color) {
      case "purple":
        return {
          bg: isLow ? "bg-red-500/20" : "bg-purple-500/20",
          border: isLow ? "border-red-500/30" : "border-purple-500/30",
          text: isLow ? "text-red-200" : "text-purple-200",
          bar: isLow ? "bg-red-500" : "bg-purple-500",
        };
      case "blue":
        return {
          bg: isLow ? "bg-red-500/20" : "bg-blue-500/20",
          border: isLow ? "border-red-500/30" : "border-blue-500/30",
          text: isLow ? "text-red-200" : "text-blue-200",
          bar: isLow ? "bg-red-500" : "bg-blue-500",
        };
      case "green":
        return {
          bg: isLow ? "bg-red-500/20" : "bg-green-500/20",
          border: isLow ? "border-red-500/30" : "border-green-500/30",
          text: isLow ? "text-red-200" : "text-green-200",
          bar: isLow ? "bg-red-500" : "bg-green-500",
        };
      case "orange":
        return {
          bg: isLow ? "bg-red-500/20" : "bg-orange-500/20",
          border: isLow ? "border-red-500/30" : "border-orange-500/30",
          text: isLow ? "text-red-200" : "text-orange-200",
          bar: isLow ? "bg-red-500" : "bg-orange-500",
        };
      default:
        return {
          bg: "bg-gray-500/20",
          border: "border-gray-500/30",
          text: "text-gray-200",
          bar: "bg-gray-500",
        };
    }
  };

  return (
    <div className={`rounded-xl bg-gray-900 border border-gray-800 p-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-white">
        API Usage Limits
      </h3>
      <div className="space-y-3">
        {limits.map((limit) => {
          const percentage = limit.current / limit.max;
          const colors = getColorClasses(limit.color, percentage);

          return (
            <div
              key={limit.name}
              className={`rounded-lg ${colors.bg} border ${colors.border} p-3`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-sm font-medium ${colors.text}`}>
                  {limit.name}
                </span>
                <span className={`text-xs ${colors.text}`}>
                  {limit.current}/{limit.max}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${colors.bar}`}
                  style={{ width: `${percentage * 100}%` }}
                ></div>
              </div>
              {limit.current === 0 && (
                <p className="mt-1 text-xs text-red-300">
                  Rate limit reached. Please wait before making more requests.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-white/60">
        <p>Limits reset every minute. Usage is tracked per session.</p>
      </div>
    </div>
  );
}
