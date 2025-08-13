#!/usr/bin/env tsx
/**
 * Image Generator using Together AI
 * Picks a random prompt and generates an image using Together AI API
 */

import { writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchAllModels } from './free-models.js';
import Together from 'together-ai';
import { generateImage as generateQwenImage } from './qwen-image.js';

// Types
interface Model {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture: {
    modality: string;
    tokenizer?: string;
  };
  capabilities?: {
    vision?: boolean;
    function_calling?: boolean;
  };
  html_url?: string;
}

interface RandomPromptResult {
  prompt: string;
  model: string;
}

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const CONFIG = {
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || '',
  FREE_MODELS_FILE: join(__dirname, 'free-models.json'),
};

/**
 * Fetch free models directly from GitHub Models catalog
 */
async function loadFreeModels(): Promise<Model[]> {
  try {
    console.log('📚 Fetching free models from GitHub Models catalog...');
    const models = await fetchAllModels();

    // Convert GitHubModel to the Model interface used in image-generator
    const convertedModels: Model[] = models.map(model => ({
      id: model.id,
      name: model.name,
      description: model.summary || '',
      pricing: {
        prompt: '0', // All GitHub models are free to use
        completion: '0'
      },
      context_length: 0, // Default value
      architecture: {
        modality: 'text',
        tokenizer: 'GitHub Models'
      },
      html_url: model.html_url || ''
    }));

    return convertedModels;
  } catch (error) {
    console.error('❌ Error fetching free models:', (error as Error).message);
    console.log('💡 Make sure to run the free-models fetcher script first!');
    throw error;
  }
}

/**
 * Pick a random model from the list
 */
function pickRandomModel(models: Model[]): Model {
  if (models.length === 0) {
    throw new Error('No models available to pick from');
  }
  const randomIndex = Math.floor(Math.random() * models.length);
  const selectedModel = models[randomIndex];
  if (!selectedModel) {
    throw new Error('Failed to select a model');
  }
  return selectedModel;
}

/**
 * Generate random image name
 */
function generateRandomImageName(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `generated-${timestamp}-${randomId}.png`;
}

/**
 * Clear all files in the images directory
 */
function clearImagesDirectory(imagesDir: string): void {
  try {
    if (existsSync(imagesDir)) {
      const files = readdirSync(imagesDir);
      for (const file of files) {
        const filePath = join(imagesDir, file);
        unlinkSync(filePath);
        console.log(`🗑️  Deleted: ${file}`);
      }
      console.log(`✅ Cleared ${files.length} files from images directory`);
    } else {
      console.log('📁 Images directory does not exist, will be created');
    }
  } catch (error) {
    console.error('❌ Error clearing images directory:', error);
  }
}

/**
 * Call GitHub Models API to generate ASCII art
/**
 * Generate a random prompt using GitHub Models API
 */
async function generateRandomPrompt(): Promise<RandomPromptResult> {
  if (!CONFIG.ADMIN_TOKEN) {
    // Return a default random prompt if no API key
    const defaultPrompts = [
      '8-bit pixel art vintage yellow sports car with chrome highlights, chunky pixels, limited 32-color palette, studio lighting gleam',
      'pixel art crystal chandelier casting rainbow prisms, strong outlines, subtle dithering, bright elegant room backdrop',
      'retro game pixel art neon arcade cabinet row with vibrant LED screens, bold colors, hard edges, glossy highlights',
      '16-bit pixel art tropical beach, turquoise waves and colorful umbrellas, sun sparkle on water, chunky pixels, clean sky',
      'pixel art hot air balloons in rainbow colors over green hills at sunrise, limited palette, soft dithering, crisp outlines',
      '8-bit pixel art red electric guitar with chrome hardware, hard-edged shading, studio glow, vibrant palette',
      'isometric pixel art glass greenhouse filled with bright flowers, sunbeams, limited palette, clean outlines',
      'pixel art city skyline at sunset, glowing windows against orange-pink sky, chunky pixels, minimal detail',
      'retro pixel art market stall with bright fruits and vegetables in baskets, sunny lighting, limited color set',
      'pixel art rainbow-lit jukebox with chrome trim, glossy pixels, vibrant LEDs, strong outlines',
      '8-bit pixel art friendly service robot on treads with cyan LEDs, shiny metal panels, radiant workshop light',
      '16-bit pixel art hover robot with ring thrusters and neon underglow, over sunny meadow, bright candy colors',
      'pixel art spider-like utility bot with articulated legs and rainbow LED strips, glossy enamel panels, luminous morning light'
    ];
    const selectedPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
    return { prompt: selectedPrompt || 'bright yellow vintage sports car gleaming under radiant studio lighting with chrome details sparkling', model: 'Fallback: Default Prompt' };
  }

  const randomPromptRequest = `You are a creative prompt generator. Generate a random and interesting subject for bright, vibrant PIXEL ART image generation.
Rules:
1. It MUST be pixel art: 8-bit or 16-bit retro game aesthetic with chunky pixels, strong outlines, limited 16–32 color palette, and optional dithering.
2. Subjects: inanimate objects, props, vehicles, buildings, instruments, food, or cute robots (no people or animals).
3. Composition: single subject or small scene; isometric or side view; clean or simple background.
4. Include bright lighting cues (sunny, glowing, radiant, luminous, or studio lighting) and material hints (metal, glass, wood) in pixel-art terms.
5. Keep it concise but imaginative (about one short sentence, max ~25 words).
6. Start with phrases like "pixel art", "8-bit pixel art", or "16-bit pixel art".
7. Only respond with the prompt, no additional text.

Generate one random bright pixel art image prompt:`;

  // Try up to 5 times with different models
  // Load free models directly from GitHub
  const freeModels = await loadFreeModels();

  // Select up to 5 random models from the free models list
  const modelsToSelect = Math.min(5, freeModels.length);

  // Create a copy of freeModels and shuffle it
  const shuffledModels: Model[] = [...freeModels];
  for (let i = shuffledModels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Type-safe swap with proper undefined checks
    if (shuffledModels[i] && shuffledModels[j]) {
      const temp: Model = shuffledModels[i]!;
      shuffledModels[i] = shuffledModels[j]!;
      shuffledModels[j] = temp;
    }
  }

  // Take the first N models from the shuffled list
  const models = shuffledModels.slice(0, modelsToSelect).map(model => model.id);

  for (let attempt = 1; attempt <= 10 && attempt <= models.length; attempt++) {
    // If we've exhausted our selected models, break
    if (attempt > models.length) {
      break;
    }

    try {
      // Import the GitHub Models API function
      const { callGitHubModelsAPI } = await import('./github-models-api.js');

      const result = await callGitHubModelsAPI(randomPromptRequest, models[attempt - 1] || 'openai/gpt-4.1');

      if (!result) {
        console.warn(`⚠️  No random prompt generated on attempt ${attempt}, trying different model`);
        continue;
      }

      return { prompt: result, model: models[attempt - 1] || 'openai/gpt-4.1' };
    } catch (error: any) {
      if (error.name === "TimeoutError" || error.message?.includes("Timeout")) {
        console.warn(`⚠️  Timeout on attempt ${attempt}, trying different model`);
      } else if (error.message?.includes("403")) {
        console.warn(`⚠️  Forbidden (403) on attempt ${attempt}, trying different model`);
      } else {
        console.warn(`⚠️  Error on attempt ${attempt}:`, error);
      }
      // Continue to next attempt
    }
  }

  // If all attempts failed, use fallback
  console.warn('⚠️  All 5 attempts to generate random prompt failed, using default prompt');
  return { prompt: 'a cat sitting on a computer keyboard', model: 'Fallback: Default Prompt' };
}

/**
 * Generate image using Qwen API first, fallback to Together AI
 */
async function generateImage(prompt: string): Promise<string> {
  // Create images directory if it doesn't exist
  const imagesDir = join(__dirname, '..', 'images');
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }

  // Try Qwen image generation first
  try {
    console.log('🎨 Trying Qwen image generation...');
    const qwenResult = await generateQwenImage(prompt);
    
    if (qwenResult.images && qwenResult.images[0]) {
      const image = qwenResult.images[0];
      
      if (image.url) {
        // Save base64 image from Qwen
        const imageName = generateRandomImageName();
        const imagePath = join(imagesDir, imageName);
        const base64 = image.url.replace(/^data:image\/\w+;base64,/, '');
        writeFileSync(imagePath, base64, "base64");
        console.log(`✅ Qwen image saved to ${imagePath}`);
        return imageName;
      } 
    }
  } catch (qwenError: any) {
    console.log('⚠️  Qwen generation failed, falling back to Together AI:', qwenError.message);
  }

  // Fallback to Together AI
  if (!CONFIG.TOGETHER_API_KEY) {
    console.log('⚠️  No Together API key found, using mock image generator for demonstration');
    return generateRandomImageName();
  }

  const together = new Together({
    apiKey: CONFIG.TOGETHER_API_KEY,
  });

  try {
    console.log('🎨 Using Together AI fallback...');
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      response_format: "base64"
    });

    // Save the base64 image data to a file
    if (response.data && response.data.length > 0) {
      const imageObject = response.data[0];
      if (imageObject && 'b64_json' in imageObject && imageObject.b64_json) {
        const imageName = generateRandomImageName();
        const imagePath = join(imagesDir, imageName);
        writeFileSync(imagePath, imageObject.b64_json, "base64");
        console.log(`✅ Together AI image saved to ${imagePath}`);
        return imageName;
      } else {
        throw new Error('❌ No image data received from Together AI');
      }
    } else {
      throw new Error('❌ No image data received from Together AI');
    }
  } catch (error: any) {
    console.error('❌ Error generating image with Together AI:', error);
    throw error;
  }
}

/**
 * Display model information
 */
function displayModelInfo(model: Model): void {
  console.log(`\n🎨 Selected Model: ${model.name}`);
  console.log(`📝 Model ID: ${model.id}`);
  console.log(`🧠 Context Length: ${model.context_length?.toLocaleString() || 'Unknown'} tokens`);
  console.log(`⚙️  Tokenizer: ${model.architecture.tokenizer}`);
  if (model.description) {
    const shortDesc = model.description.length > 150
      ? model.description.substring(0, 150) + '...'
      : model.description;
    console.log(`📖 Description: ${shortDesc}`);
  }
  console.log('💰 Pricing: FREE!\n');
}

/**
 * Save image information to README.md
 */
async function saveImageToFile(imageName: string, prompt: string, promptModel: Model): Promise<void> {
  try {
    // Path to README.md file
    const readmePath = join(__dirname, '..', 'README.md');

    // Create content with image markdown and prompt model information only
    const readmeContent = `**Model**: [${promptModel.name} (${promptModel.id})](${promptModel.html_url || '#'})

**Prompt**: ${prompt}

## Generated Image

![Generated Image](./images/${imageName})
`;

    // Write content to README.md (completely replace existing content)
    writeFileSync(readmePath, readmeContent);
    console.log('💾 README.md completely replaced with image and model info');
  } catch (error) {
    console.error('❌ Error replacing README.md with image:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  // Check for API key and warn if not found
  if (!CONFIG.ADMIN_TOKEN) {
    console.log('⚠️  No API key found, using mock ASCII art generator for demonstration');
  }

  console.log('🎨 Image Generator with Random Free Models');
  console.log('='.repeat(50));

  try {
    // Load free models
    console.log('📚 Loading free models...');
    const freeModels = await loadFreeModels();
    console.log(`✅ Found ${freeModels.length} free models`);

    // Pick random model
    const selectedModel = pickRandomModel(freeModels);
    displayModelInfo(selectedModel);

    // Always generate a random prompt
    console.log('🎲 Generating random prompt...');
    const promptResult = await generateRandomPrompt();
    const originalPrompt = promptResult.prompt;
    console.log(`🎯 Random prompt: "${originalPrompt}"`);
    console.log(`🧠 Prompt generated by: ${promptResult.model}`);

    // Find the actual model in our free models list to get the html_url
    const allFreeModels = await loadFreeModels();
    const actualPromptModel = allFreeModels.find(model => model.id === promptResult.model);

    // Create a Model object for the prompt generation model
    const promptModel: Model = {
      id: promptResult.model, // Use the actual model ID that generated the prompt
      name: promptResult.model.split('/').pop() || promptResult.model, // Extract just the model name part
      description: 'Model used for generating random prompts',
      context_length: 0,
      architecture: {
        modality: 'text',
        tokenizer: 'GitHub Models'
      },
      pricing: {
        prompt: '0',
        completion: '0'
      },
      html_url: actualPromptModel?.html_url || ''
    };

    console.log('⏳ Please wait...\n');

    // Clear images directory before generating new image
    const imagesDir = join(__dirname, '..', 'images');
    clearImagesDirectory(imagesDir);

    // Generate image with retry logic
    let imageName = '';
    let asciiArtModel = selectedModel;
    let maxRetries = 10;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        imageName = await generateImage(originalPrompt);
        break; // Success, exit the loop
      } catch (artError: any) {
        retries++;
        if (artError.name === "TimeoutError" || artError.message?.includes("Timeout")) {
          console.log(`⚠️  Image generation attempt ${retries} timed out, trying different model`);
        } else if (artError.message?.includes("403")) {
          console.log(`⚠️  Image generation attempt ${retries} forbidden (403), trying different model`);
        } else {
          console.log(`⚠️  Image generation attempt ${retries} failed, trying different model`);
        }

        // If we've exhausted our retries, re-throw the error
        if (retries >= maxRetries) {
          throw artError;
        }

        // Pick a different model for retry
        asciiArtModel = pickRandomModel(freeModels);
        console.log(`🔄 Retrying with model: ${asciiArtModel.name}`);
      }
    }

    // Display result
    console.log('🎨 Generated Image:');
    console.log('='.repeat(50));
    console.log(`✨ Generated image: ${imageName}`);
    console.log('='.repeat(50));
    console.log(`✨ Generated by: ${asciiArtModel.name}`);

    // Save to file with model info
    try {
      // Save both the image name and the model information that generated the prompt and art
      await saveImageToFile(imageName, originalPrompt, promptModel);
      console.log('✅ Successfully updated README.md with image and model info!');
    } catch (saveError) {
      console.error('⚠️  Failed to update README.md with image, but generation was successful');
    }

  } catch (error) {
    console.error('❌ Failed to generate image:', error);
    process.exit(1);
  }
}

/**
 * Export functions for module usage
 */
export {
  loadFreeModels,
  pickRandomModel,
  generateImage,
  generateRandomPrompt,
  displayModelInfo,
  type Model,
  type RandomPromptResult
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
