#!/usr/bin/env tsx
/**
 * ASCII Art Generator using Random Free Models from GitHub Models
 * Picks a random free model and generates ASCII art based on user input
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchAllModels } from './free-models.js';

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
  FREE_MODELS_FILE: join(__dirname, 'free-models.json'),
};

/**
 * Fetch free models directly from GitHub Models catalog
 */
async function loadFreeModels(): Promise<Model[]> {
  try {
    console.log('📚 Fetching free models from GitHub Models catalog...');
    const models = await fetchAllModels();
    
    // Convert GitHubModel to the Model interface used in ascii-art-generator
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
      }
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
 * Generate mock ASCII art for demonstration purposes
 */
function generateMockAsciiArt(prompt: string): string {
  // This is a simple mock generator that creates basic ASCII art
  // In a real implementation, this would be replaced with actual API calls
  
  const mockArts: Record<string, string> = {
    "dog": `        __\n    (___())\`\n    /,    /\n   //\'--\'\\\n  /         \\`,
    "cat": `    /\_/\  \n   ( ^.^ )\n    )   (\n   ( v v )\n  ^^  |  ^^`,
    "hat": `    _____\n   /     \\\n  | () () |\n   \\  ^  /\n    |||||\n    |||||`,
    "default": `  _______\n /       \\\n|  O   O  |\n|    ∆    |\n \\_______/\n    | |\n    | |`
  };

  // Try to match the prompt to a known mock art
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("dog") && mockArts.dog) return cleanupAsciiArt(mockArts.dog);
  if (lowerPrompt.includes("cat") && mockArts.cat) return cleanupAsciiArt(mockArts.cat);
  if (lowerPrompt.includes("hat") && mockArts.hat) return cleanupAsciiArt(mockArts.hat);
  
  // Return default mock art
  const defaultArt = mockArts.default || "  _______\n /       \\n|  O   O  |\n|    ∆    |\n \\_______/\n    | |\n    | |";
  return cleanupAsciiArt(defaultArt);
}

/**
 * Call GitHub Models API to generate ASCII art
 */
/**
 * Generate a random prompt using GitHub Models API
 */
async function generateRandomPrompt(): Promise<RandomPromptResult> {
  if (!CONFIG.ADMIN_TOKEN) {
    // Return a default random prompt if no API key
    const defaultPrompts = [
      'a cat sitting on a computer keyboard',
      'a dog wearing sunglasses',
      'a robot making coffee',
      'a dragon flying over mountains',
      'a spaceship landing on mars',
      'a wizard casting spells',
      'a knight with shining armor',
      'a futuristic city skyline',
      'a wise owl reading a book',
      'a playful dolphin jumping'
    ];
    const selectedPrompt = defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
    return { prompt: selectedPrompt || 'a cat sitting on a computer keyboard', model: 'Fallback: Default Prompt' };
  }

  const randomPromptRequest = `You are a creative prompt generator. Generate a random and interesting subject for ASCII art.
Rules:
1. Be creative and unique
2. Focus on concrete subjects (animals, objects, characters, scenes)
3. Include some descriptive details
4. Keep it concise but imaginative
5. Only respond with the prompt, no additional text

Generate one random ASCII art prompt:`;

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
  
  for (let attempt = 1; attempt <= 5 && attempt <= models.length; attempt++) {
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
    } catch (error) {
      console.warn(`⚠️  Error on attempt ${attempt}:`, error);
      // Continue to next attempt
    }
  }

  // If all attempts failed, use fallback
  console.warn('⚠️  All 5 attempts to generate random prompt failed, using default prompt');
  return { prompt: 'a cat sitting on a computer keyboard', model: 'Fallback: Default Prompt' };
}

/**
 * Clean up ASCII art to ensure proper bracket closure and formatting
 */
function cleanupAsciiArt(asciiArt: string): string {
  let cleaned = asciiArt.trim();
  
  // Count and balance common bracket types
  const brackets = [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '{', close: '}' },
    { open: '<', close: '>' }
  ];
  
  for (const bracket of brackets) {
    const openCount = (cleaned.match(new RegExp('\\' + bracket.open, 'g')) || []).length;
    const closeCount = (cleaned.match(new RegExp('\\' + bracket.close, 'g')) || []).length;
    
    // If we have more opening brackets than closing, add closing brackets
    if (openCount > closeCount) {
      const missing = openCount - closeCount;
      cleaned += bracket.close.repeat(missing);
    }
  }
  
  return cleaned;
}

/**
 * Call GitHub Models API to generate ASCII art
 */
async function generateAsciiArt(model: Model, prompt: string): Promise<string> {
  if (!CONFIG.ADMIN_TOKEN) {
    console.log('⚠️  No API key found, using mock ASCII art generator for demonstration');
    return generateMockAsciiArt(prompt);
  }

  // Import the GitHub Models API function
  const { callGitHubModelsAPI } = await import('./github-models-api.js');

  const systemPrompt = `You are an ASCII art generator. Create detailed ASCII art based on the user's request. 
Rules:
1. Use only standard ASCII characters (no Unicode)
2. Make the art detailed and recognizable
3. Use different characters for shading (., -, =, #, @, etc.)
4. Keep the art reasonably sized (max 50 lines)
5. Only respond with the ASCII art, no additional text or explanation`;

  const fullPrompt = `${systemPrompt}\n\nCreate ASCII art of: ${prompt}`;

  try {
    const result = await callGitHubModelsAPI(fullPrompt, model.id);
    return cleanupAsciiArt(result);
  } catch (error) {
    console.error('❌ Error calling GitHub Models API:', error);
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
 * Save ASCII art to a file
 */
async function saveAsciiArtToFile(asciiArt: string, prompt: string, promptModel: Model, asciiArtModel: Model): Promise<void> {
  try {
    // Path to README.md file
    const readmePath = join(__dirname, '..', 'README.md');
    
    // Create content with ASCII art and model information
    const readmeContent = `# ASCII Art Generator Output

## Random Prompt

**Model**: ${promptModel.name} (${promptModel.id})

**Prompt**: ${prompt}

## ASCII Art

${asciiArt}

## Generation Model

**Model**: ${asciiArtModel.name} (${asciiArtModel.id})
`;
    
    // Write content to README.md (completely replace existing content)
    writeFileSync(readmePath, readmeContent);
    console.log('💾 README.md completely replaced with ASCII art and model info');
  } catch (error) {
    console.error('❌ Error replacing README.md with ASCII art:', error);
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

  console.log('🎨 ASCII Art Generator with Random Free Models');
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
      }
    };

    console.log('⏳ Please wait...\n');

    // Generate ASCII art with retry logic
    let asciiArt = '';
    let asciiArtModel = selectedModel;
    let maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        asciiArt = await generateAsciiArt(asciiArtModel, originalPrompt);
        break; // Success, exit the loop
      } catch (artError) {
        retries++;
        console.log(`⚠️  ASCII art generation attempt ${retries} failed, trying different model`);
        
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
    console.log('🎨 Generated ASCII Art:');
    console.log('='.repeat(50));
    console.log(asciiArt);
    console.log('='.repeat(50));
    console.log(`✨ Generated by: ${asciiArtModel.name}`);

    // Save to file with model info
    try {
      // Save both the ASCII art and the model information that generated the prompt and art
      await saveAsciiArtToFile(asciiArt, originalPrompt, promptModel, asciiArtModel);
      console.log('✅ Successfully updated README.md with ASCII art and model info!');
    } catch (saveError) {
      console.error('⚠️  Failed to update README.md with ASCII art, but generation was successful');
    }

  } catch (error) {
    console.error('❌ Failed to generate ASCII art:', error);
    process.exit(1);
  }
}

/**
 * Export functions for module usage
 */
export {
  loadFreeModels,
  pickRandomModel,
  generateAsciiArt,
  generateRandomPrompt,
  displayModelInfo,
  cleanupAsciiArt,
  type Model,
  type RandomPromptResult
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
