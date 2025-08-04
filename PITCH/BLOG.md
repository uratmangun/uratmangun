# OpenRouter Free Models: Discovering AI Capabilities Through ASCII Art

## Introduction

In the rapidly evolving world of AI development, finding the right model for your project can be overwhelming. With hundreds of models available on platforms like OpenRouter, developers often struggle to identify which models are completely free to use. That's where OpenRouter Free Models comes in - a TypeScript utility that not only discovers all free AI models but showcases their capabilities through creative ASCII art generation.

## What is OpenRouter Free Models?

OpenRouter Free Models is a comprehensive TypeScript utility designed to solve a common developer pain point: discovering which AI models on OpenRouter are completely free to use. The project goes beyond simple discovery by creating an interactive ASCII art generator that demonstrates the creative capabilities of these free models.

The tool automatically fetches all available models from the OpenRouter API, filters them based on pricing (identifying models with zero cost for both prompt and completion), and then uses these models to generate creative ASCII art from AI-generated prompts. It's both a practical utility and a creative showcase of what's possible with free AI models.

## Tech Stack & Architecture

The project leverages modern web technologies and follows best practices for TypeScript development:

### Frontend/UI Technologies
- **TypeScript**: Provides type safety and better development experience
- **ES Modules**: Modern JavaScript module system for clean architecture
- **tsx**: TypeScript execution for development and testing

### Backend/Database Technologies  
- **Node.js**: Runtime environment for server-side execution
- **OpenRouter API**: Unified access to multiple AI models
- **node-fetch**: HTTP client for API communication
- **dotenv**: Secure environment variable management

### Development Tools
- **pnpm**: Efficient package management with yarn fallback
- **GitHub Actions**: Automated workflows and CI/CD
- **Fish Shell**: Advanced shell scripting and automation
- **Kiro AI**: Spec-driven development and automated workflows

## Development Methodology: Kiro Specifications

This project follows spec-driven development using Kiro specifications, which provides a structured approach to building features:

- **Requirements**: User stories and acceptance criteria for each feature
- **Design**: Technical architecture and implementation approach  
- **Tasks**: Discrete, trackable implementation steps

### Specifications Created:

**ASCII Art Generator Enhancement**: A comprehensive spec that defined the requirements for random prompt generation, ASCII art creation with model selection, model information tracking, and GitHub Actions integration. The spec included 8 completed tasks with detailed acceptance criteria and technical design decisions.

This methodology improved development by providing clear requirements, systematic design decisions, and measurable progress tracking. It enabled focused development with comprehensive error handling and robust retry mechanisms.

## Key Features

1. **Automated Model Discovery**: Fetches and filters all free models from OpenRouter API, providing detailed information about capabilities, context length, and architecture.

2. **Creative ASCII Art Generation**: Uses random free models to generate creative prompts and corresponding ASCII artwork, showcasing the diverse capabilities of different AI models.

3. **Intelligent Retry Logic**: Implements sophisticated error handling with model fallbacks, ensuring reliable operation even when individual models fail or are unavailable.

4. **Comprehensive Documentation**: Automatically generates and updates project documentation, including README files and model information.

5. **Development Automation**: Features 22 automated Kiro hooks for documentation, pitch generation, commit automation, and content generation.

## Demo

{% embed https://github.com/uratmangun/uratmangun %}

## Getting Started

To get started with OpenRouter Free Models:

```bash
# Clone the repository
git clone https://github.com/uratmangun/uratmangun.git
cd openrouter-free-models

# Install dependencies using pnpm (preferred)
pnpm install

# Copy environment template and add your OpenRouter API key
cp .env.example .env

# Fetch all free models
pnpm run fetch-models

# Generate ASCII art
pnpm run ascii-art
```

The tool works with or without an API key - it includes fallback mechanisms for demonstration purposes when API access isn't available.

## Conclusion

Building OpenRouter Free Models was an excellent demonstration of how modern TypeScript development can be enhanced through spec-driven development and AI-assisted coding. The project successfully combines practical utility with creative expression, making AI model discovery both informative and entertaining.

The use of Kiro AI for development automation proved invaluable, saving hours of repetitive work while maintaining professional documentation standards. The spec-driven approach ensured clear requirements and systematic implementation, resulting in robust, production-ready code.

## Technical Deep Dive

### Project Structure

The project follows a clean, modular architecture:

- `scripts/free-models.ts`: Core logic for fetching and filtering free models
- `scripts/ascii-art-generator.ts`: ASCII art generation with retry mechanisms  
- `scripts/free-models.json`: Cached model data for offline use
- `.kiro/specs/`: Structured specifications for feature development
- `.kiro/hooks/`: Automated development workflows
- `.kiro/steering/`: Development standards and preferences

### Key Dependencies

- **@types/node**: TypeScript definitions for Node.js
- **tsx**: TypeScript execution and development tooling
- **typescript**: TypeScript compiler and language support
- **dotenv**: Environment variable management
- **node-fetch**: HTTP client for API requests

### Development Workflow

The development process leveraged Kiro's capabilities extensively:

1. **Spec Creation**: Structured requirements gathering with user stories and acceptance criteria
2. **Design Documentation**: Technical architecture decisions and implementation approaches
3. **Task Management**: Trackable implementation steps with clear completion criteria
4. **Automated Workflows**: 22 hooks for documentation, testing, and deployment automation
5. **Steering Rules**: Consistent development standards for shell usage, package management, and server policies

This workflow resulted in efficient development with comprehensive error handling, robust retry mechanisms, and professional documentation standards throughout the project lifecycle.

The combination of spec-driven development and AI assistance created a powerful development experience that balanced structure with flexibility, resulting in a polished, production-ready utility that serves both practical and creative purposes.