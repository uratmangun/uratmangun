# OpenRouter Free Models

## Inspiration
The inspiration came from the challenge developers face when trying to discover which AI models on OpenRouter are completely free to use. With hundreds of models available, it's time-consuming to manually check pricing for each one. We wanted to create a tool that not only identifies free models but also demonstrates their capabilities in a fun, creative way through ASCII art generation.

## What it does
OpenRouter Free Models is a TypeScript utility that automatically discovers and showcases all free AI models available on OpenRouter. The project features:

- **Free Model Discovery**: Automatically fetches and filters all free models from OpenRouter API
- **ASCII Art Generator**: Creates creative ASCII art using random free models
- **Model Analytics**: Provides detailed information about each model's capabilities, context length, and architecture
- **JSON Export**: Saves model data for programmatic use by other developers
- **Retry Logic**: Robust error handling with model fallbacks for reliable operation
- **Random Prompts**: AI-generated creative prompts for diverse ASCII art outputs

## How we built it
The project was built using modern TypeScript with ES modules architecture. We implemented a comprehensive API client for OpenRouter, created intelligent model filtering logic, and developed an ASCII art generation system with sophisticated retry mechanisms. The development process followed Kiro's spec-driven approach with structured requirements, design documents, and trackable implementation tasks.

Key technical components:
- **Free Models Fetcher**: Retrieves and filters models based on pricing
- **Random Prompt Generator**: Creates creative prompts using retry logic with different models
- **ASCII Art Generator**: Produces ASCII art from prompts using randomly selected models
- **README Updater**: Automatically updates documentation with generated content
- **GitHub Actions Integration**: Automates the generation and update process

## Challenges we ran into
- **API Rate Limits**: Handling OpenRouter API limitations and model availability
- **Model Reliability**: Implementing robust retry logic for failed model calls
- **Response Format Variations**: Managing different model response formats and capabilities
- **Fallback Mechanisms**: Creating graceful degradation when API keys are unavailable
- **Error Handling**: Developing comprehensive error handling for various failure scenarios
- **TypeScript Complexity**: Ensuring type safety across async operations and API responses

## Accomplishments that we're proud of
- **Automated 22 Development Workflows**: Created comprehensive Kiro hooks for documentation, pitch generation, and git automation
- **Spec-Driven Development**: Successfully implemented structured requirements with user stories, technical design, and trackable tasks
- **Robust Error Handling**: Built sophisticated retry mechanisms that gracefully handle model failures
- **Professional Documentation**: Generated comprehensive project documentation automatically
- **Type-Safe Implementation**: Achieved full TypeScript coverage with strict type checking
- **Production-Ready Code**: Created maintainable, well-structured code with proper separation of concerns

## What we learned
- **OpenRouter Ecosystem**: Deep understanding of the model landscape and API integration patterns
- **AI Service Integration**: Best practices for working with external AI APIs and handling their limitations
- **TypeScript Module Systems**: Advanced usage of ES modules and modern JavaScript architecture
- **Spec-Driven Development**: How structured requirements and design documents improve development velocity
- **Automation Benefits**: The power of hooks and automated workflows in maintaining project consistency
- **Error Resilience**: Importance of fallback mechanisms when working with external services

## What's next for OpenRouter Free Models
- **Web Interface**: Building a user-friendly web application for interactive model exploration
- **Image Generation Support**: Extending to support free image generation models
- **Model Performance Benchmarking**: Adding performance metrics and comparison features
- **Multi-Provider Integration**: Expanding to include other AI service providers
- **Batch Processing**: Implementing batch ASCII art generation capabilities
- **Community Features**: Adding sharing and collaboration features for generated artwork
- **Real-time Updates**: Implementing live model availability monitoring
- **Advanced Filtering**: Adding more sophisticated model filtering and search capabilities

## Built with
- **TypeScript**: Type-safe JavaScript development with strict checking
- **Node.js**: Runtime environment for server-side execution
- **OpenRouter API**: Access to multiple AI models through unified interface
- **tsx**: TypeScript execution and development tooling
- **dotenv**: Secure environment variable management
- **node-fetch**: HTTP client for API communication
- **ES Modules**: Modern JavaScript module system
- **GitHub Actions**: Automated workflows and CI/CD
- **Kiro AI**: Spec-driven development and automated workflows
- **Fish Shell**: Advanced shell scripting and automation
- **pnpm**: Efficient package management with yarn fallback

## Project Name
OpenRouter Free Models Discovery & ASCII Art Generator

## Elevator pitch
Discover and showcase all free AI models on OpenRouter through automated discovery and creative ASCII art generation, eliminating the guesswork for developers while demonstrating model capabilities in an engaging way.