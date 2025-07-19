// Export all ML services
export * from "./replicate";

// ML Service Types
export interface MLPrediction {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Common ML operation result type
export interface MLResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  predictionId?: string;
}

// Utility functions for ML operations
export class MLUtils {
  /**
   * Validate image URL or base64 string
   */
  static isValidImageInput(input: string): boolean {
    // Check if it's a valid URL
    try {
      new URL(input);
      return true;
    } catch {
      // Check if it's a valid base64 image
      const base64Regex = /^data:image\/(png|jpg|jpeg|gif|webp);base64,/;
      return base64Regex.test(input);
    }
  }

  /**
   * Sanitize text input for ML models
   */
  static sanitizeTextInput(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .slice(0, 10000); // Limit length to prevent token overflow
  }

  /**
   * Generate a safe filename for ML outputs
   */
  static generateSafeFilename(prefix = "ml_output"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Format ML error messages for user display
   */
  static formatErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unexpected error occurred during ML processing";
  }
}

// Rate limiting and quota management
export class MLRateLimit {
  private static requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

  /**
   * Check if user has exceeded rate limit
   */
  static checkRateLimit(
    userId: string,
    maxRequests = 10,
    windowMs = 60000,
  ): boolean {
    const now = Date.now();
    const userLimit = this.requestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.requestCounts.set(userId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Get remaining requests for user
   */
  static getRemainingRequests(userId: string, maxRequests = 10): number {
    const userLimit = this.requestCounts.get(userId);
    if (!userLimit || Date.now() > userLimit.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - userLimit.count);
  }
}
