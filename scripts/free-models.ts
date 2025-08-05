/**
 * GitHub Models Fetcher
 * Fetches and lists all models available from GitHub Models catalog
 */

import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

interface GitHubModel {
  id: string;
  name: string;
  publisher?: string;
  registry?: string;
  summary?: string;
  html_url?: string;
  version?: string;
  capabilities?: string[];
  limits?: {
    max_input_tokens?: number;
    max_output_tokens?: number;
  };
  rate_limit_tier?: string;
  supported_input_modalities?: string[];
  supported_output_modalities?: string[];
  tags?: string[];
}

interface GitHubModelsResponse {
  // The API returns an array directly, not an object with a models property
  [index: number]: GitHubModel;
  length: number;
}

/**
 * Fetches all available models from GitHub Models catalog
 */
async function fetchAllModels(): Promise<GitHubModel[]> {
  try {
    const githubPat = process.env.ADMIN_TOKEN;
    
    if (!githubPat) {
      throw new Error("ADMIN_TOKEN environment variable is not set. Please add it to your .env file.");
    }
    
    const response = await fetch('https://models.github.ai/catalog/models', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${githubPat}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GitHubModel[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Filters models to only include free ones with text output modality
 */
function filterFreeModels(models: GitHubModel[]): GitHubModel[] {
  return models.filter(model => 
    model.supported_output_modalities && 
    model.supported_output_modalities.includes('text') &&
    model.rate_limit_tier === 'high'
  );
}

/**
 * Formats and displays model information in a readable format
 */
function displayModel(model: GitHubModel): void {
  console.log(`\n📝 ${model.name} (${model.id})`);
  if (model.publisher) {
    console.log(`   Publisher: ${model.publisher}`);
  }
  if (model.summary) {
    console.log(`   Summary: ${model.summary}`);
  }
  if (model.registry) {
    console.log(`   Registry: ${model.registry}`);
  }
  if (model.version) {
    console.log(`   Version: ${model.version}`);
  }
  if (model.limits) {
    if (model.limits.max_input_tokens) {
      console.log(`   Max Input Tokens: ${model.limits.max_input_tokens.toLocaleString()}`);
    }
    if (model.limits.max_output_tokens) {
      console.log(`   Max Output Tokens: ${model.limits.max_output_tokens.toLocaleString()}`);
    }
  }
  if (model.tags && model.tags.length > 0) {
    console.log(`   Tags: ${model.tags.join(', ')}`);
  }
  if (model.capabilities && model.capabilities.length > 0) {
    console.log(`   Capabilities: ${model.capabilities.join(', ')}`);
  }
  if (model.html_url) {
    console.log(`   URL: ${model.html_url}`);
  }
}

/**
 * Main function to fetch and display all models
 */
async function listFreeModels(): Promise<void> {
  try {
    console.log('🚀 Fetching all models from GitHub Models...\n');
    
    const allModels = await fetchAllModels();
    console.log(`📊 Total models available: ${allModels.length}`);
    
    const freeModels = filterFreeModels(allModels);
    console.log(`🆓 Free models found: ${freeModels.length}\n`);
    
    if (freeModels.length === 0) {
      console.log('❌ No free models found.');
      return;
    }

    console.log('='.repeat(80));
    console.log('🤖 MODELS AVAILABLE FROM GITHUB');
    console.log('='.repeat(80));
    
    // Sort by name for better readability
    freeModels
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(displayModel);
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Listed ${freeModels.length} free models successfully!`);
    
    // Export to JSON file for programmatic use
    await saveFreeModelsToFile(freeModels);

    console.log('\n✅ Done! Check models/github-models.json for the full list.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

/**
 * Saves GitHub models data to a JSON file
 */
async function saveFreeModelsToFile(models: GitHubModel[]): Promise<void> {
  try {
    // For Node.js environment with ES modules
    if (typeof process !== 'undefined' && process.versions?.node) {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      const outputPath = path.join(__dirname, 'models/github-models.json');
      await fs.promises.writeFile(outputPath, JSON.stringify(models, null, 2));
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
  GitHubModel as Model,
};

// Run if this file is executed directly (ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  listFreeModels();
}
