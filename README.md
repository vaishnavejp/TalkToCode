# TalkToCode VS Code Extension

## Overview

**TalkToCode** is a Visual Studio Code extension that leverages a language model (LLM) to assist with code explanations, code reviews, and language conversions. It adds a webview panel to the VS Code interface where you can interact with the extension, sending selected code to an LLM for feedback or transformation.

## Features

- **Explain Code**: Select a block of code and ask the LLM to provide an explanation.
- **Code Review**: Have your selected code reviewed and commented by the LLM.
- **Code Conversion**: Convert your code to another programming language.
- **Progress Feedback**: Shows a progress bar while the LLM processes your request.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/vaishnavejp/TalkToCode.git
   ```
2. Navigate into the project folder:
   ```bash
   cd TalkToCode
   ```
4. Install the dependencies:
   ```bash
   npm install
   ```

# Usage

1. Select a block of code in the editor.
2. Run the `TalkToCode` command:
   * Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   * Type and select `TalkToCode: TalkToCode`.
3. The extension will open a webview panel, and you'll be able to:
   * **Explain**: If your selected code contains the word `"explain"`, the LLM will provide a detailed explanation.
   * **Review**: If your selected code contains the word `"review"`, the LLM will review the code and add comments.
   * **Convert**: If your selected code doesn't match the above cases, the LLM will attempt to convert your code to another language.
4. The progress bar will show the progress of the LLM's work.

# Environment Variables

Make sure to set up the required environment variables:

* `BEARER_TOKEN`: The token used for authenticating API requests to the LLM.

You can set environment variables by creating a `.env` file in the root of your project:

```bash
BEARER_TOKEN=your_token_here

6. Open the project in Visual Studio Code:
   ```bash
   code .
   ```
8. Compile and run the extension
