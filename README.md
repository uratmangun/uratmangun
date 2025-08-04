# OpenRouter Free Models & ASCII Art Generator

A TypeScript utility that fetches all free models available on GitHub Models and generates ASCII art using random model selection. This project demonstrates how to interact with GitHub's AI model catalog and create creative ASCII art through AI-powered generation.

**Model**: [cohere-command-a (cohere/cohere-command-a)](https://github.com/marketplace/models/azureml-cohere/cohere-command-a)

**Prompt**: A majestic, moonlit owl perched on a gnarled oak branch, its feathers ruffled by a gentle breeze, with glowing eyes reflecting the starry night sky.

## ASCII Art

```
          _____
         /     \
        /_______\
        |  _  _  |
        |  o  o  | 
        |   ^    | 
        |  _/    | 
         \_______/ 
            ||
            ||  ___
            ||_/   \
            ||      |
            ||      |_
            ||        \
            ||         \
            ||          \
            ||     _____\_
            ||    /       \
            ||   /         \
            ||  /  .  .     \
            || /   ..  .     \
            ||/    .  ..      \
            ||     .   .       \
            ||     ..   .       \
            ||     .    ..       \
            ||     ..    .        \
            ||     .     ..        \
            ||     ..     .         \
            ||     .      ..         \
            ||____/________\_________\
```

**Model**: [Grok 3 (xai/grok-3)](https://github.com/marketplace/models/azureml-xai/grok-3)

## Features

- 🤖 **Free Model Discovery**: Automatically fetches all free models from GitHub Models catalog
- 🎨 **ASCII Art Generation**: Creates ASCII art using AI models with random prompt generation
- 🎲 **Random Model Selection**: Picks random models for both prompt generation and ASCII art creation
- 📊 **Model Information Display**: Shows detailed information about selected models
- 💾 **Automatic Documentation**: Updates README.md with generated art and model details
- 🔄 **Retry Logic**: Handles timeouts and errors with automatic model switching

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd openrouter-free-models
```

2. Install dependencies using pnpm (preferred) or yarn:
```bash
pnpm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your GitHub Personal Access Token to `.env`:
```
ADMIN_TOKEN=your_github_pat_here
```

## Usage

### Fetch Available Models
```bash
pnpm run fetch-models
```

### Generate ASCII Art
```bash
pnpm run ascii-art
# or
pnpm dev
```

### Build the Project
```bash
pnpm build
```

### Type Check
```bash
pnpm run type-check
```

## Project Structure

```
openrouter-free-models/
├── scripts/
│   ├── ascii-art-generator.ts    # Main ASCII art generation logic
│   ├── free-models.ts           # GitHub Models API fetcher
│   └── github-models-api.ts     # GitHub Models API client
├── .env.example                 # Environment variables template
├── package.json                 # Project configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file (auto-updated)
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Node.js**: Runtime environment
- **GitHub Models API**: AI model access and inference
- **dotenv**: Environment variable management
- **tsx**: TypeScript execution
- **pnpm**: Fast, disk space efficient package manager

## Configuration

The project requires a GitHub Personal Access Token with appropriate permissions to access the GitHub Models API. Create a `.env` file based on `.env.example` and add your token:

```env
ADMIN_TOKEN=ghp_your_token_here
```

## How It Works

1. **Model Discovery**: The `free-models.ts` script fetches all available models from GitHub's catalog
2. **Random Selection**: The system picks a random free model for ASCII art generation
3. **Prompt Generation**: Another random model generates creative prompts for ASCII art
4. **Art Creation**: The selected model creates ASCII art based on the generated prompt
5. **Documentation**: Results are automatically saved to README.md with model attribution

## API Integration

The project integrates with GitHub Models API to:
- List all available models in the catalog
- Filter for free models with text output capabilities
- Generate creative prompts using AI
- Create ASCII art through model inference
- Handle API timeouts and errors gracefully

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*This README is automatically updated when ASCII art is generated. The content above reflects the current project structure and capabilities.*