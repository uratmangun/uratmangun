// To run this code you need to install the following dependencies:
// npm install @google/genai
// npm install -D @types/node

import { GoogleGenAI, PersonGeneration } from '@google/genai';
import { writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

// Images directory path
const imagesDir = join(__dirname, '..', 'images');

function generateRandomImageName(): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `generated-${timestamp}-${randomId}.jpeg`;
}

function clearImagesDirectory(dir: string): void {
  try {
    if (existsSync(dir)) {
      const files = readdirSync(dir);
      for (const file of files) {
        unlinkSync(join(dir, file));
        console.log(`🗑️  Deleted: ${file}`);
      }
      console.log(`✅ Cleared ${files.length} files from images directory`);
    } else {
      console.log('📁 Images directory does not exist, creating...');
      mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error('❌ Error clearing images directory:', error);
  }
}

function saveBinaryFile(filePath: string, content: Buffer) {
  try {
    writeFileSync(filePath, content);
    console.log(`💾 Saved image to ${filePath}`);
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateImages({
    model: 'models/imagen-3.0-generate-002',
    prompt: `a cat`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      personGeneration: PersonGeneration.ALLOW_ALL,
      aspectRatio: '1:1',
    },
  });

  if (!response?.generatedImages) {
    console.error('No images generated.');
    return;
  }

  if (response.generatedImages.length !== 1) {
    console.error('Number of images generated does not match the requested number.');
  }

  // Ensure images directory exists and clear it before saving new images
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
  }
  clearImagesDirectory(imagesDir);

  for (let i = 0; i < response.generatedImages.length; i++) {
    if (!response.generatedImages?.[i]?.image?.imageBytes) {
      continue;
    }
    const fileName = generateRandomImageName();
    const inlineData = response?.generatedImages?.[i]?.image?.imageBytes;
    const buffer = Buffer.from(inlineData || '', 'base64');
    const filePath = join(imagesDir, fileName);
    saveBinaryFile(filePath, buffer);
  }
}

main();