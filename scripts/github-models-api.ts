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
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(60000) // 1 minute timeout
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
  } catch (error: any) {
    if (error.name === "TimeoutError") {
      console.error("Timeout calling GitHub Models API:", error.message);
      throw new Error(`Timeout calling GitHub Models API: ${error.message}`);
    } else {
      console.error("Error calling GitHub Models API:", error);
      throw error;
    }
  }
}

/**
 * Generates images using the GitHub Models API
 * @param prompt The prompt to generate images from
 * @returns The generated image
 */
async function generateImageFromGitHub(prompt: string): Promise<string> {
  try {
    // For image generation, we might want to specify a specific instruction
    const imagePrompt = `Please create an image for the following subject: ${prompt}`;
    const response = await callGitHubModelsAPI(imagePrompt);
    return response;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Saves images to a file in the outputs directory
 * @param image The image to save
 * @param prompt The original prompt used to generate the image
 * @returns The file path where the image was saved
 */
function saveImageToFile(image: string, prompt: string): string {
  // Create outputs directory if it doesn't exist
  const outputsDir = path.join(__dirname, '..', 'outputs');
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `image-${timestamp}.txt`;
  const filepath = path.join(outputsDir, filename);

  // Save image to file
  fs.writeFileSync(filepath, image);

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
export { callGitHubModelsAPI, generateImageFromGitHub, saveImageToFile };

// Run main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
