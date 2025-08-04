#!/usr/bin/env tsx
/**
 * ASCII Art Generator using Random Free Models from OpenRouter
 * Picks a random free model and generates ASCII art based on user input
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

interface OpenRouterChatRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

interface OpenRouterChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
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
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  OPENROUTER_HTTP_REFERER: process.env.OPENROUTER_HTTP_REFERER || 'https://github.com/openrouter/ascii-art-generator',
  OPENROUTER_X_TITLE: process.env.OPENROUTER_X_TITLE || 'ASCII Art Generator',
  FREE_MODELS_FILE: join(__dirname, 'free-models.json'),
};

/**
 * Load free models from JSON file
 */
function loadFreeModels(): Model[] {
  try {
    const jsonData = readFileSync(CONFIG.FREE_MODELS_FILE, 'utf-8');
    const models = JSON.parse(jsonData) as Model[];
    
    // Filter to ensure we only get truly free models
    return models.filter(model => 
      model.pricing.prompt === '0' && 
      model.pricing.completion === '0' &&
      model.architecture.modality.includes('text')
    );
  } catch (error) {
    console.error('❌ Error loading free models:', error);
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
 * Call OpenRouter API to generate ASCII art
 */
/**
 * Generate a random prompt using OpenRouter API
 */
async function generateRandomPrompt(): Promise<RandomPromptResult> {
  if (!CONFIG.OPENROUTER_API_KEY) {
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
  // Load free models from the JSON file
  const freeModelsData = readFileSync(join(__dirname, 'free-models.json'), 'utf-8');
  const freeModels: Model[] = JSON.parse(freeModelsData);
  
  // Select up to 5 random models from the free models list
  const modelsToSelect = Math.min(5, freeModels.length);
  
  // Create a copy of freeModels and shuffle it
  const shuffledModels: Model[] = [...freeModels];
  for (let i = shuffledModels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Type-safe swap using non-null assertions
    const temp: Model = shuffledModels[i]!;
    shuffledModels[i] = shuffledModels[j]!;
    shuffledModels[j] = temp;
  }
  
  // Take the first N models from the shuffled list
  const models = shuffledModels.slice(0, modelsToSelect).map(model => model.id);
  
  for (let attempt = 1; attempt <= 5 && attempt <= models.length; attempt++) {
    // If we've exhausted our selected models, break
    if (attempt > models.length) {
      break;
    }
    
    const requestBody: OpenRouterChatRequest = {
      model: models[attempt - 1] || 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: randomPromptRequest
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    };

    try {
      const response = await fetch(`${CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': CONFIG.OPENROUTER_HTTP_REFERER,
          'X-Title': CONFIG.OPENROUTER_X_TITLE,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.warn(`⚠️  Random prompt generation attempt ${attempt} failed (${response.status}), trying different model`);
        continue;
      }

      const data = await response.json() as OpenRouterChatResponse;
      
      if (!data.choices || data.choices.length === 0) {
        console.warn(`⚠️  No random prompt generated on attempt ${attempt}, trying different model`);
        continue;
      }

      const firstChoice = data.choices[0];
      if (!firstChoice?.message?.content) {
        console.warn(`⚠️  Invalid response format on attempt ${attempt}, trying different model`);
        continue;
      }

      return { prompt: firstChoice.message.content, model: data.model };
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
 * Call OpenRouter API to generate ASCII art
 */
async function generateAsciiArt(model: Model, prompt: string): Promise<string> {
  if (!CONFIG.OPENROUTER_API_KEY) {
    console.log('⚠️  No API key found, using mock ASCII art generator for demonstration');
    return generateMockAsciiArt(prompt);
  }

  const systemPrompt = `You are an ASCII art generator. Create detailed ASCII art based on the user's request. 
Rules:
1. Use only standard ASCII characters (no Unicode)
2. Make the art detailed and recognizable
3. Use different characters for shading (., -, =, #, @, etc.)
4. Keep the art reasonably sized (max 50 lines)
5. Only respond with the ASCII art, no additional text or explanation`;

  const requestBody: OpenRouterChatRequest = {
    model: model.id,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Create ASCII art of: ${prompt}`
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  };

  try {
    const response = await fetch(`${CONFIG.OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': CONFIG.OPENROUTER_HTTP_REFERER,
        'X-Title': CONFIG.OPENROUTER_X_TITLE,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as OpenRouterChatResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated from the model');
    }

    const firstChoice = data.choices[0];
    if (!firstChoice?.message?.content) {
      throw new Error('Invalid response format from the model');
    }

    return cleanupAsciiArt(firstChoice.message.content);
  } catch (error) {
    console.error('❌ Error calling OpenRouter API:', error);
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
  if (!CONFIG.OPENROUTER_API_KEY) {
    console.log('⚠️  No API key found, using mock ASCII art generator for demonstration');
  }

  console.log('🎨 ASCII Art Generator with Random Free Models');
  console.log('='.repeat(50));

  try {
    // Load free models
    console.log('📚 Loading free models...');
    const freeModels = loadFreeModels();
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
        tokenizer: 'OpenRouter'
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
  type OpenRouterChatRequest,
  type OpenRouterChatResponse,
  type RandomPromptResult
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
