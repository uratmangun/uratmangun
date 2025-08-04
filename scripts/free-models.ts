/**
 * OpenRouter Free Models Fetcher
 * Fetches and lists all free models available on OpenRouter
 */

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
  top_provider: {
    max_completion_tokens?: number;
  };
}

interface OpenRouterResponse {
  data: Model[];
}

/**
 * Fetches all available models from OpenRouter API
 */
async function fetchAllModels(): Promise<Model[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Filters models to only include free ones (pricing is "0" for both prompt and completion)
 */
function filterFreeModels(models: Model[]): Model[] {
  return models.filter(model => 
    model.pricing.prompt === '0' && model.pricing.completion === '0'
  );
}

/**
 * Formats and displays model information in a readable format
 */
function displayModel(model: Model): void {
  console.log(`\n📝 ${model.name} (${model.id})`);
  if (model.description) {
    console.log(`   Description: ${model.description}`);
  }
  console.log(`   Context Length: ${model.context_length.toLocaleString()} tokens`);
  console.log(`   Modality: ${model.architecture.modality}`);
  console.log(`   Tokenizer: ${model.architecture.tokenizer}`);
  if (model.top_provider.max_completion_tokens) {
    console.log(`   Max Completion: ${model.top_provider.max_completion_tokens.toLocaleString()} tokens`);
  }
  console.log(`   Pricing: FREE (${model.pricing.prompt}/${model.pricing.completion})`);
}

/**
 * Main function to fetch and display all free models
 */
async function listFreeModels(): Promise<void> {
  try {
    console.log('🚀 Fetching all models from OpenRouter...\n');
    
    const allModels = await fetchAllModels();
    console.log(`📊 Total models available: ${allModels.length}`);
    
    const freeModels = filterFreeModels(allModels);
    console.log(`🆓 Free models found: ${freeModels.length}\n`);
    
    if (freeModels.length === 0) {
      console.log('❌ No free models found.');
      return;
    }

    console.log('='.repeat(80));
    console.log('🆓 FREE MODELS AVAILABLE ON OPENROUTER');
    console.log('='.repeat(80));
    
    // Sort by name for better readability
    freeModels
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(displayModel);
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Listed ${freeModels.length} free models successfully!`);
    
    // Export to JSON file for programmatic use
    await saveFreeModelsToFile(freeModels);
    
  } catch (error) {
    console.error('❌ Failed to fetch free models:', error);
  }
}

/**
 * Saves free models data to a JSON file
 */
async function saveFreeModelsToFile(freeModels: Model[]): Promise<void> {
  try {
    // For Node.js environment with ES modules
    if (typeof process !== 'undefined' && process.versions?.node) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const outputPath = path.join(__dirname, 'free-models.json');
      await fs.promises.writeFile(outputPath, JSON.stringify(freeModels, null, 2));
      console.log(`💾 Free models data saved to: ${outputPath}`);
    }
  } catch (error) {
    console.log('ℹ️  Could not save to file (running in browser?)');
  }
}

/**
 * Export for module usage
 */
export {
  fetchAllModels,
  filterFreeModels,
  listFreeModels,
  type Model,
  type OpenRouterResponse
};

// Run if this file is executed directly (ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  listFreeModels();
}
