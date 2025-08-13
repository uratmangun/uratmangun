import ky from 'ky';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname,join } from 'path';
import dotenv from 'dotenv';
// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configuration
const API_URL = 'https://router.huggingface.co/fal-ai/fal-ai/qwen-image';
const HF_TOKEN = process.env.HF_TOKEN || ''; // Set your Hugging Face token in environment

interface QwenImageRequest {
  sync_mode: boolean;
  prompt: string;
}

interface QwenImageResponse {
  images?: Array<{
    url?: string;
    content?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

/**
 * Generate an image using Qwen Image model via Hugging Face router
 * @param prompt - The text prompt for image generation
 * @param token - Optional Hugging Face bearer token (uses env var if not provided)
 * @returns The API response containing generated image data
 */
async function generateImage(prompt: string, token?: string): Promise<QwenImageResponse> {
  const authToken = token || HF_TOKEN;
  
  if (!authToken) {
    throw new Error('HF_TOKEN environment variable is not set. Please set it or pass a token.');
  }

  const payload: QwenImageRequest = {
    sync_mode: true,
    prompt: prompt
  };

  try {
    console.log(`🎨 Generating image for prompt: "${prompt}"`);
    
    const response = await ky.post(API_URL, {
      json: payload,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 second timeout
    }).json<QwenImageResponse>();

    console.log('✅ Image generated successfully');
    return response;
  } catch (error) {
    console.error('❌ Error generating image:', error);
    throw error;
  }
}

/**
 * Save base64 image to file
 * @param base64Data - Base64 encoded image data
 * @param filename - Output filename
 */
function saveBase64Image(base64Data: string, filename: string): void {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  
  const outputDir = path.join(__dirname, '../outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`💾 Image saved to: ${filepath}`);
}

/**
 * Main function to demonstrate usage
 */
async function main() {
  // Get prompt from command line arguments or use default
  const prompt = process.argv[2] || 'a mountain pixel art';
  
  try {
    // Generate image
    const result = await generateImage(prompt);
    
    // Log the full response for debugging
    console.log('\n📊 Response structure:');
    console.log(JSON.stringify(result, null, 2));
    
    // Save image if it's in base64 format
    if (result.images && result.images[0]) {
      const image = result.images[0];
      
      if (image.content) {
        // If image is returned as base64 content
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `qwen-image-${timestamp}.png`;
        saveBase64Image(image.content, filename);
      } else if (image.url) {
        // If image is returned as URL
        console.log(`🔗 Image URL: ${image.url}`);
        console.log('💡 Tip: You can download the image from the URL above');
      }
    }
    
  } catch (error) {
    console.error('Failed to generate image:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for use as module
export { generateImage, saveBase64Image };