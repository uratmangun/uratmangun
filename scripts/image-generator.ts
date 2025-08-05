#!/usr/bin/env tsx
/**
 * Image Generator using Together AI
 * Picks a random prompt and generates an image using Together AI API
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchAllModels } from './free-models.js';
import Together from 'together-ai';

// Types
interface Model {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
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
    throw error;
    console.log('💡 Make sure to run the free-models fetcher script first!');
    process.exit(1);
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
 * Generate mock image name for demonstration purposes
 */
function generateMockImageName(prompt: string): string {
  // This is a simple mock generator that creates a mock image file name
  // In a real implementation, this would be replaced with actual API calls
  
  return `generated-image.png`;
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
      'a majestic oak tree in a field',
      'a wooden chair in a cozy room',
      'a vintage lamp on a desk',
      'a mountain landscape at sunset',
      'a house with a garden and fence',
      'a bookshelf filled with books',
      'a classic car in a driveway',
      'a bridge over a calm river',
      'a lighthouse on a rocky shore',
      'a castle on a hill'
    ];
    const selectedPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
    return { prompt: selectedPrompt || 'a majestic oak tree in a field', model: 'Fallback: Default Prompt' };
  }

  const randomPromptRequest = `You are a creative prompt generator. Generate a random and interesting subject for image generation.
Rules:
1. Be creative and unique
2. Focus on concrete inanimate subjects (trees, furniture, buildings, landscapes, etc.)
3. Include some descriptive details
4. Keep it concise but imaginative
5. Only respond with the prompt, no additional text

Generate one random image generation prompt:`;

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
 * Call GitHub Models API to generate ASCII art
 */
async function generateImage(prompt: string): Promise<string> {
  if (!CONFIG.TOGETHER_API_KEY) {
    console.log('⚠️  No API key found, using mock image generator for demonstration');
    return generateMockImageName(prompt);
  }

  const together = new Together({
    apiKey: CONFIG.TOGETHER_API_KEY,
  });

  try {
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      response_format: "base64"
    });

    // Create images directory if it doesn't exist
    const imagesDir = join(__dirname, '..', 'images');
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    // Save the base64 image data to a file
    if (response.data && response.data.length > 0) {
      const imageObject = response.data[0];
      if (imageObject && 'b64_json' in imageObject && imageObject.b64_json) {
        const imageName = `generated-image.png`;
        const imagePath = join(imagesDir, imageName);
        writeFileSync(imagePath, imageObject.b64_json, "base64");
        console.log(`✅ Image saved to ${imagePath}`);
        return imageName;
      } else {
        throw new Error('❌ No image data received');
      }
    } else {
      throw new Error('❌ No image data received');
    }
  } catch (error: any) {
    console.error('❌ Error generating image:', error);
    throw error;
  }
}

/**
 * Display model information
 */
function displayModelInfo(model: Model): void {
  console.log(`\n🎨 Selected Model: ${model.name}`);
  console.log(`📝 Model ID: ${model.id}`);
  console.log(`🧠 Context Length: ${model.context_length.toLocaleString()} tokens`);
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
