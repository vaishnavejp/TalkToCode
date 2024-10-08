# TalkToCode Visual Studio Code Extension

## Overview

**TalkToCode** is a Visual Studio Code extension that leverages a large language model (LLM) to assist with code explanations, code reviews, and language conversions. It adds a webview panel to the VS Code interface where you can interact with the extension, sending selected code to an LLM for feedback or transformation.

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
5. Compile and run the extension
   - Press F5 to open a new VS Code window with the extension enabled

# Usage

1. Select a block of code in the editor.
2. Run the `TalkToCode` command:
   * Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS).
   * Type and select `TalkToCode: TalkToCode`.
3. The extension will open a webview panel, and you'll be able to:
   * **Explain**: If your prompt contains the word `"explain"`, the LLM will provide a detailed explanation.
   * **Review**: If your prompt contains the word `"review"`, the LLM will review the code and add comments.
   * **Convert**: If your prompt contains the word ` convert to ABC language`, the LLM will attempt to convert your code to that language.
4. The progress bar will show the progress of the LLM's work.

# Environment Variables

Make sure to set up the required Bearer token:

* `BEARER_TOKEN`: The token used for authenticating API requests to the LLM - get this from the website mentioned in the end.

```bash
replace <YOUR_BEARER_TOKEN> in src/extension.ts file with your token. Dont include the word Bearer
```

# Webview Content

The webview content is loaded from the `media` folder. Ensure the following files exist:

* `media/chat.html`: The HTML content for the webview.
* `media/chat.css`: Stylesheet for the webview.
* `media/chat.js`: JavaScript to handle webview functionality.

# API Integration

This extension uses the **Meta-Llama-3.1-8B-Instruct** model for code explanation, review, and conversion. It interacts with the API using the following endpoint:

```plaintext
POST https://api.arliai.com/v1/chat/completions
```
