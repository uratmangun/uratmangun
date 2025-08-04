# ASCII Art Generator Enhancement Requirements

## Introduction
The ASCII Art Generator is a TypeScript project that fetches and lists all free AI models from Github ai models and generates ASCII art using those models. The generator works completely automatically, producing random creative prompts and ASCII art using free models from OpenRouter, with robust fallback mechanisms and clear model attribution in the README.md file.

## Requirements

### Requirement 1: Random Prompt Generation
**User Story:** As a user, I want the ASCII art generator to always create random prompts using OpenRouter AI, so that I can see unexpected and creative ASCII art outputs.

#### Acceptance Criteria
1. WHEN the generator is executed THEN the system SHALL ignore any command line arguments and generate a random prompt
2. WHEN the OpenRouter API is available THEN the system SHALL use it to generate creative prompts
3. WHEN the OpenRouter API is not available THEN the system SHALL use fallback default prompts
4. WHEN prompt generation fails with a model THEN the system SHALL retry with up to 5 different free models

### Requirement 2: ASCII Art Generation with Model Selection
**User Story:** As a user, I want the ASCII art generator to create detailed ASCII art using randomly selected free models, so that I can see varied outputs from different AI models.

#### Acceptance Criteria
1. WHEN the generator runs THEN the system SHALL randomly select a free model from the OpenRouter API for ASCII art generation
2. WHEN ASCII art generation fails with a model THEN the system SHALL retry with up to 3 different free models
3. WHEN no API key is provided THEN the system SHALL use a mock ASCII art generator for demonstration

### Requirement 3: Model Information Tracking
**User Story:** As a user, I want to see which models were used for both prompt generation and ASCII art generation, so that I can understand which AI models contributed to the output.

#### Acceptance Criteria
1. WHEN ASCII art is generated THEN the system SHALL track and display the model that generated the random prompt
2. WHEN ASCII art is generated THEN the system SHALL track and display the model that generated the ASCII art
3. WHEN displaying model information THEN the system SHALL show both model name and ID
4. WHEN writing to README.md THEN the system SHALL include both prompt model and ASCII art model information

### Requirement 4: GitHub Actions Workflow Integration
**User Story:** As a developer, I want the GitHub Actions workflow to properly execute the enhanced ASCII art generator, so that the README.md file is automatically updated with new content on schedule.

#### Acceptance Criteria
1. WHEN the GitHub Actions workflow runs THEN the system SHALL use environment variables from GitHub Secrets for API authentication
2. WHEN the workflow executes THEN the system SHALL completely replace the README.md content with the new ASCII art and model information
3. WHEN the workflow completes successfully THEN the system SHALL commit and push the updated README.md to the repository
