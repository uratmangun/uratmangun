# ASCII Art Generator Enhancement Design

## Architecture Overview
The ASCII Art Generator consists of several key components:
1. Free models fetcher - retrieves and filters free models from OpenRouter API
2. Random prompt generator - creates creative prompts using retry logic with different models
3. ASCII art generator - produces ASCII art from prompts using randomly selected models
4. README updater - writes generated art and model information to README.md
5. GitHub Actions workflow - automates the generation and update process

## Technical Approach
The implementation follows these technical strategies:
- Use dotenv for secure environment variable management
- Implement retry mechanisms with exponential backoff for API calls
- Use TypeScript for type safety and better code maintainability
- Overwrite README.md content completely rather than appending
- Handle model-specific limitations gracefully with fallback models

## Component Design

### Free Models Fetcher
- **Purpose**: Retrieve and filter free AI models from OpenRouter API
- **Dependencies**: OpenRouter API, fs module for file writing
- **Interface**: Returns array of Model objects with pricing information

### Random Prompt Generator
- **Purpose**: Generate creative prompts using OpenRouter AI with retry logic
- **Dependencies**: Free models fetcher, OpenRouter API
- **Interface**: Returns RandomPromptResult with prompt string and model ID

### ASCII Art Generator
- **Purpose**: Create ASCII art from prompts using randomly selected free models
- **Dependencies**: Free models fetcher, OpenRouter API
- **Interface**: Takes a Model and prompt string, returns generated ASCII art

### README Updater
- **Purpose**: Write ASCII art and model information to README.md
- **Dependencies**: fs module for file operations
- **Interface**: Takes ASCII art, prompt, and both model objects to create formatted output

## Data Flow
1. Script loads free models from JSON file (created by free-models.ts)
2. Script selects a random model for ASCII art generation
3. Script generates a random prompt using retry logic with up to 5 different models
4. Script generates ASCII art using the selected model with retry logic for failures
5. Script overwrites README.md with formatted output including both models and art

## Technical Considerations
- **Performance**: Retry mechanisms may increase execution time but improve reliability
- **Security**: API keys are stored in environment variables and GitHub Secrets
- **Scalability**: Model selection is dynamic and adapts to available free models
- **Error Handling**: Comprehensive error handling for API failures and model limitations
