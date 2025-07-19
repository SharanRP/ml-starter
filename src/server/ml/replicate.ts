import Replicate from "replicate";
import { env } from "~/env";

// Initialize Replicate client
export const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
});

// Common ML model configurations
export const ML_MODELS = {
  // Image Generation
  STABLE_DIFFUSION:
    "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
  FLUX_SCHNELL: "black-forest-labs/flux-schnell",

  // Text Generation & Summarization
  LLAMA_2_70B:
    "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
  MISTRAL_7B:
    "mistralai/mistral-7b-instruct-v0.1:83b6a56e7c828e667f21fd596c338fd4f0039b46bcfa18d973e8e70e455fda70",

  // Image Classification & Analysis
  CLIP: "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
  BLIP: "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",

  // Image Enhancement
  REAL_ESRGAN:
    "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
} as const;

// Type definitions for ML operations
export interface ImageGenerationInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface TextSummarizationInput {
  text: string;
  max_length?: number;
  temperature?: number;
}

export interface ImageClassificationInput {
  image: string; // URL or base64
  labels?: string[];
}

// ML Service Functions
export class MLService {
  /**
   * Generate an image using Stable Diffusion
   */
  static async generateImage(input: ImageGenerationInput): Promise<string[]> {
    try {
      const output = (await replicate.run(ML_MODELS.FLUX_SCHNELL, {
        input: {
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          ...input,
        },
      })) as string[];

      return output;
    } catch (error) {
      console.error("Image generation failed:", error);
      throw new Error("Failed to generate image");
    }
  }

  /**
   * Summarize text using Llama 2
   */
  static async summarizeText(input: TextSummarizationInput): Promise<string> {
    try {
      const prompt = `Please provide a concise summary of the following text:\n\n${input.text}\n\nSummary:`;

      const output = (await replicate.run(ML_MODELS.LLAMA_2_70B, {
        input: {
          prompt,
          max_new_tokens: input.max_length ?? 150,
          temperature: input.temperature ?? 0.7,
          top_p: 0.9,
          repetition_penalty: 1.15,
        },
      })) as string[];

      return output.join("").trim();
    } catch (error) {
      console.error("Text summarization failed:", error);
      throw new Error("Failed to summarize text");
    }
  }

  /**
   * Classify or analyze an image using BLIP
   */
  static async analyzeImage(input: ImageClassificationInput): Promise<string> {
    try {
      const output = (await replicate.run(ML_MODELS.BLIP, {
        input: {
          image: input.image,
          task: "image_captioning",
        },
      })) as unknown as string;

      return output;
    } catch (error) {
      console.error("Image analysis failed:", error);
      throw new Error("Failed to analyze image");
    }
  }

  /**
   * Enhance image quality using Real-ESRGAN
   */
  static async enhanceImage(imageUrl: string): Promise<string> {
    try {
      const output = (await replicate.run(ML_MODELS.REAL_ESRGAN, {
        input: {
          image: imageUrl,
          scale: 4,
          face_enhance: false,
        },
      })) as unknown as string;

      return output;
    } catch (error) {
      console.error("Image enhancement failed:", error);
      throw new Error("Failed to enhance image");
    }
  }

  /**
   * Get prediction status and result
   */
  static async getPrediction(predictionId: string) {
    try {
      return await replicate.predictions.get(predictionId);
    } catch (error) {
      console.error("Failed to get prediction:", error);
      throw new Error("Failed to get prediction status");
    }
  }
}
