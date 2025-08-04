# Implementation Plan

- [x] 1. Remove user prompt input functionality
  - Modify main function to always generate random prompts regardless of command line arguments
  - Remove conditional logic that checked for user-provided prompts
  - Ensure the generator works in a single mode that always produces random results
  - _Requirements: 1.1_

- [x] 2. Update README display logic
  - Modify saveAsciiArtToFile function to completely replace README.md content
  - Remove the preservation of existing README.md content
  - Format the output to show both prompt and ASCII art generation models
  - _Requirements: 3.4_

- [x] 3. Implement random prompt generation retry logic
  - Create a shuffle function to randomize free models list
  - Implement retry mechanism that attempts up to 5 different models
  - Add fallback to default prompts when all retry attempts fail
  - _Requirements: 1.4_

- [x] 4. Enhance ASCII art generation with model retry logic
  - Implement retry mechanism that attempts up to 3 different models
  - Handle model-specific errors like "Developer instruction is not enabled"
  - Add proper error handling and logging for retry attempts
  - _Requirements: 2.2_

- [x] 5. Track and display model information
  - Modify generateRandomPrompt to return both prompt and model ID
  - Create Model objects for both prompt generation and ASCII art generation
  - Update README writing logic to show both models and their IDs
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Fix TypeScript lint errors
  - Resolve type checking issues with array operations
  - Fix undefined value assignments in model selection
  - Ensure all functions have proper type annotations
  - _Requirements: None (quality improvement)_

- [x] 7. Update GitHub Actions workflow
  - Modify workflow to use new script logic that overwrites README.md
  - Remove outdated file handling and update logic
  - Ensure proper use of GitHub Secrets for environment variables
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Rename Windsurf workflow files
  - Convert all filenames in .windsurf/workflows to lowercase
  - Replace spaces in filenames with dashes
  - _Requirements: None (file organization)_
