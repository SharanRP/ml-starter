import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { MLService, MLUtils, MLRateLimit, type MLResult } from "~/server/ml";

// Input validation schemas
const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  negative_prompt: z.string().optional(),
  width: z.number().min(256).max(1024).optional().default(512),
  height: z.number().min(256).max(1024).optional().default(512),
  num_inference_steps: z.number().min(1).max(50).optional().default(20),
  guidance_scale: z.number().min(1).max(20).optional().default(7.5),
  seed: z.number().optional(),
});

const textSummarizationSchema = z.object({
  text: z.string().min(10).max(10000),
  max_length: z.number().min(50).max(500).optional().default(150),
  temperature: z.number().min(0.1).max(2.0).optional().default(0.7),
});

const imageAnalysisSchema = z.object({
  image: z.string().url().or(z.string().startsWith("data:image/")),
  labels: z.array(z.string()).optional(),
});

const imageEnhancementSchema = z.object({
  image: z.string().url(),
});

export const mlRouter = createTRPCRouter({
  /**
   * Generate an image from text prompt
   */
  generateImage: publicProcedure
    .input(imageGenerationSchema)
    .mutation(async ({ input, ctx }): Promise<MLResult<string[]>> => {
      try {
        // Get user ID for rate limiting (use session ID if authenticated, IP if not)
        const userId =
          ctx.session?.user?.id ??
          ctx.headers?.get("x-forwarded-for") ??
          "anonymous";

        // Check rate limit (5 requests per minute for image generation)
        if (!MLRateLimit.checkRateLimit(userId, 5, 60000)) {
          throw new Error(
            "Rate limit exceeded. Please wait before generating another image.",
          );
        }

        // Sanitize input
        const sanitizedPrompt = MLUtils.sanitizeTextInput(input.prompt);
        const sanitizedNegativePrompt = input.negative_prompt
          ? MLUtils.sanitizeTextInput(input.negative_prompt)
          : undefined;

        // Generate image
        const result = await MLService.generateImage({
          ...input,
          prompt: sanitizedPrompt,
          negative_prompt: sanitizedNegativePrompt,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("Image generation error:", error);
        return {
          success: false,
          error: MLUtils.formatErrorMessage(error),
        };
      }
    }),

  /**
   * Summarize text content
   */
  summarizeText: publicProcedure
    .input(textSummarizationSchema)
    .mutation(async ({ input, ctx }): Promise<MLResult<string>> => {
      try {
        // Get user ID for rate limiting
        const userId =
          ctx.session?.user?.id ??
          ctx.headers?.get("x-forwarded-for") ??
          "anonymous";

        // Check rate limit (10 requests per minute for text summarization)
        if (!MLRateLimit.checkRateLimit(userId, 10, 60000)) {
          throw new Error(
            "Rate limit exceeded. Please wait before summarizing more text.",
          );
        }

        // Sanitize input
        const sanitizedText = MLUtils.sanitizeTextInput(input.text);

        // Summarize text
        const result = await MLService.summarizeText({
          ...input,
          text: sanitizedText,
        });

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("Text summarization error:", error);
        return {
          success: false,
          error: MLUtils.formatErrorMessage(error),
        };
      }
    }),

  /**
   * Analyze and describe an image
   */
  analyzeImage: publicProcedure
    .input(imageAnalysisSchema)
    .mutation(async ({ input, ctx }): Promise<MLResult<string>> => {
      try {
        // Get user ID for rate limiting
        const userId =
          ctx.session?.user?.id ??
          ctx.headers?.get("x-forwarded-for") ??
          "anonymous";

        // Check rate limit (8 requests per minute for image analysis)
        if (!MLRateLimit.checkRateLimit(userId, 8, 60000)) {
          throw new Error(
            "Rate limit exceeded. Please wait before analyzing another image.",
          );
        }

        // Validate image input
        if (!MLUtils.isValidImageInput(input.image)) {
          throw new Error(
            "Invalid image format. Please provide a valid URL or base64 image.",
          );
        }

        // Analyze image
        const result = await MLService.analyzeImage(input);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("Image analysis error:", error);
        return {
          success: false,
          error: MLUtils.formatErrorMessage(error),
        };
      }
    }),

  /**
   * Enhance image quality
   */
  enhanceImage: publicProcedure
    .input(imageEnhancementSchema)
    .mutation(async ({ input, ctx }): Promise<MLResult<string>> => {
      try {
        // Get user ID for rate limiting
        const userId =
          ctx.session?.user?.id ??
          ctx.headers?.get("x-forwarded-for") ??
          "anonymous";

        // Check rate limit (3 requests per minute for image enhancement)
        if (!MLRateLimit.checkRateLimit(userId, 3, 60000)) {
          throw new Error(
            "Rate limit exceeded. Please wait before enhancing another image.",
          );
        }

        // Validate image URL
        if (!MLUtils.isValidImageInput(input.image)) {
          throw new Error("Invalid image URL provided.");
        }

        // Enhance image
        const result = await MLService.enhanceImage(input.image);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("Image enhancement error:", error);
        return {
          success: false,
          error: MLUtils.formatErrorMessage(error),
        };
      }
    }),

  /**
   * Get user's remaining rate limit quota
   */
  getRateLimit: publicProcedure.query(({ ctx }) => {
    const userId =
      ctx.session?.user?.id ??
      ctx.headers?.get("x-forwarded-for") ??
      "anonymous";

    return {
      imageGeneration: MLRateLimit.getRemainingRequests(userId, 5),
      textSummarization: MLRateLimit.getRemainingRequests(userId, 10),
      imageAnalysis: MLRateLimit.getRemainingRequests(userId, 8),
      imageEnhancement: MLRateLimit.getRemainingRequests(userId, 3),
    };
  }),

  /**
   * Health check for ML services
   */
  healthCheck: publicProcedure.query(() => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        replicate: "available",
      },
    };
  }),
});
