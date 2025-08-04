# OpenRouter Free Models

A TypeScript utility to discover and utilize all free models available on OpenRouter, featuring an ASCII art generator that showcases these models in action.

## Features

- 🆓 **Free Model Discovery**: Automatically fetches and lists all free models from OpenRouter
- 🎨 **ASCII Art Generator**: Creates ASCII art using random free models
- 📊 **Model Analytics**: Detailed information about each model's capabilities
- 💾 **JSON Export**: Saves model data for programmatic use
- 🔄 **Retry Logic**: Robust error handling with model fallbacks
- 🎲 **Random Prompts**: AI-generated creative prompts for ASCII art

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd openrouter-free-models

# Install dependencies using pnpm (preferred)
pnpm install

# Or use yarn as fallback
yarn install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your OpenRouter API key to `.env`:
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_HTTP_REFERER=https://github.com/your-username/your-repo
OPENROUTER_X_TITLE=Your App Name
```

## Usage

### Fetch Free Models

```bash
# Fetch and display all free models
pnpm run fetch-models

# This will:
# - Query OpenRouter API for all available models
# - Filter for completely free models (0 cost for prompt and completion)
# - Display detailed information about each model
# - Save results to scripts/free-models.json
```

### Generate ASCII Art

```bash
# Generate ASCII art with random prompts and models
pnpm run ascii-art

# Or use the dev script
pnpm dev
```

The ASCII art generator will:
1. Load the list of free models
2. Generate a random creative prompt using a free model
3. Create ASCII art based on that prompt using another random free model
4. Display the results and update README.md

## Project Structure

```
openrouter-free-models/
├── scripts/
│   ├── free-models.ts          # Model fetching and filtering logic
│   ├── ascii-art-generator.ts  # ASCII art generation with OpenRouter
│   └── free-models.json        # Cached free models data
├── .env.example                # Environment template
├── package.json                # Project configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Node.js**: Runtime environment
- **OpenRouter API**: Access to multiple AI models
- **tsx**: TypeScript execution
- **dotenv**: Environment variable management
- **node-fetch**: HTTP client for API calls

## API Reference

### Core Functions

```typescript
// Fetch all models from OpenRouter
const models = await fetchAllModels();

// Filter for free models only
const freeModels = filterFreeModels(models);

// Generate ASCII art with a specific model
const art = await generateAsciiArt(model, prompt);

// Generate random creative prompts
const { prompt, model } = await generateRandomPrompt();
```

### Model Interface

```typescript
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
```

## Scripts

- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm dev` - Run ASCII art generator in development mode
- `pnpm start` - Run compiled ASCII art generator
- `pnpm fetch-models` - Fetch and display free models
- `pnpm ascii-art` - Generate ASCII art
- `pnpm type-check` - Check TypeScript types without compilation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see the LICENSE file for details.

## Keywords

- OpenRouter
- AI Models
- Free LLM
- ASCII Art
- TypeScript
- API Integration
