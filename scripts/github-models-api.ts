import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

// Interface for the GitHub Models API response
interface GitHubModelsResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

// Interface for the message structure
interface Message {
  role: string;
  content: string;
}

/**
 * Calls the GitHub Models API to generate a response
 * @param prompt The user's prompt
 * @param model The model to use for generation
 * @returns The generated response from the model
 */
async function callGitHubModelsAPI(prompt: string, model: string = "openai/gpt-4.1"): Promise<string> {
  const githubPat = process.env.ADMIN_TOKEN;
  
  if (!githubPat) {
    throw new Error("ADMIN_TOKEN environment variable is not set. Please add it to your .env file.");
  }

  const url = "https://models.github.ai/inference/chat/completions";
  
  const messages: Message[] = [
    {
      role: "user",
      content: prompt
    }
  ];

  const data = {
    model: model,
    messages: messages
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${githubPat}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const result: GitHubModelsResponse = await response.json();
    
    if (result.choices && result.choices.length > 0 && result.choices[0]?.message?.content) {
      return result.choices[0].message.content;
    } else {
      throw new Error("No response content received from the model");
    }
  } catch (error) {
    console.error("Error calling GitHub Models API:", error);
    throw error;
  }
}

/**
 * Generates ASCII art using the GitHub Models API
 * @param prompt The prompt to generate ASCII art from
 * @returns The generated ASCII art
 */
async function generateASCIIArt(prompt: string): Promise<string> {
  try {
    // For ASCII art generation, we might want to specify a specific instruction
    const asciiPrompt = `Please create ASCII art for the following subject: ${prompt}`;
    const result = await callGitHubModelsAPI(asciiPrompt);
    return result;
  } catch (error) {
    console.error("Error generating ASCII art:", error);
    throw error;
  }
}

/**
 * Saves ASCII art to a file in the outputs directory
 * @param asciiArt The ASCII art to save
 * @param prompt The original prompt used to generate the ASCII art
 */
function saveASCIIArtToFile(asciiArt: string, prompt: string): string {
  // Create outputs directory if it doesn't exist
  const outputsDir = path.join(__dirname, '..', 'outputs');
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `ascii-art-${timestamp}.txt`;
  const filepath = path.join(outputsDir, filename);

  // Save ASCII art to file
  fs.writeFileSync(filepath, asciiArt);

  return filepath;
}

// Main function to demonstrate usage
async function main() {
  const args = process.argv.slice(2);
  const prompt = args.length > 0 ? args.join(' ') : "What is the capital of France?";
  
  console.log("Original prompt:", prompt);
  
  try {
    const response = await callGitHubModelsAPI(prompt);
    console.log("Model response:");
    console.log(response);
    
    // If you want to save the response to a file
    // const filepath = saveASCIIArtToFile(response, prompt);
    // console.log(`Response saved to: ${filepath}`);
  } catch (error) {
    console.error("Failed to generate response:", error);
    process.exit(1);
  }
}

// Export functions for use in other modules
export { callGitHubModelsAPI, generateASCIIArt, saveASCIIArtToFile };

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}
