import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// declare types 
let secretStorage: vscode.SecretStorage;
let panel: vscode.WebviewPanel;
let apiKey: any;

export async function activate(context: vscode.ExtensionContext) {

    // Store and retrieve secret (API key) in VS Code's secret storage
    secretStorage = context.secrets;
    await secretStorage.store('BEARER_TOKEN', 'f3771319-5ea7-4d7a-86d3-6081a0edb268');
    apiKey = await secretStorage.get('BEARER_TOKEN');

    // Register a command that is invoked via the command palette or keybindings to run the extension
    const disposable = vscode.commands.registerCommand('talktocode.talktocode', () => {
        vscode.window.showInformationMessage('Hello from team Code Switch!');

        // Create a new webview panel beside the current editor
        panel = vscode.window.createWebviewPanel(
            'talktocode',
            'TalkToCode',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true, // Allow JavaScript in the webview
                retainContextWhenHidden: true // Keep the webview active even when hidden
            }
        );

        // Load and set the webview content (HTML, CSS, JS)
        const html = getWebViewContent(context, panel);
        panel.webview.html = html;

        const editor = vscode.window.activeTextEditor;

        // Get the selected text from the active editor
        let selectedText = '';
        if (editor) {
            const selection = editor.selection;
            selectedText = editor.document.getText(selection).trim().toLowerCase();
        }

        // Listen for messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'sendPrompt':

                        // Check if any text is selected, if not, display error message
                        if (!selectedText) {
                            vscode.window.showErrorMessage("No code selected.");
                        }

                        // Show a loading in the webview
                        panel.webview.postMessage({ command: 'showLoading' });

                        // Process the selected text and send a prompt to the LLM with a progress bar
                        const promptResponse = await vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "I am thinking...",
                            cancellable: true
                        }, async (progress, token) => {
                            token.onCancellationRequested(() => {
                                console.log("User canceled the long running operation");
                            });

                            // Progress simulation
                            progress.report({ increment: 0 });
                            for (let i = 0; i < 100; i++) {
                                setTimeout(() => {
                                    progress.report({ increment: 1, message: ` Progress - ${i}` });
                                }, (i + 1) * 1000);
                            }

                            // Call appropriate LLM API based on the selected text (explain, review, or convert)
                            const p = new Promise((resolve, reject) => {
                                const combinedPrompt = `${selectedText}\n${message.prompt}`;

                                if (selectedText.includes("explain")) {
                                    sendToLLMExplain(combinedPrompt)
                                        .then((response) => {
                                            progress.report({ increment: 100, message: `LLM has finally responded!` });
                                            setTimeout(() => {
                                                resolve(response);
                                            }, 1000);
                                        })

                                }

                                else if (selectedText.includes("review")) {
                                    sendToLLMReview(combinedPrompt)
                                        .then((response) => {
                                            progress.report({ increment: 100, message: `LLM has finally responded!` });
                                            setTimeout(() => {
                                                resolve(response);
                                            }, 1000);
                                        })
                                }
                                else {
                                    sendToLLMConvert(combinedPrompt, selectedText)
                                        .then((response) => {
                                            progress.report({ increment: 100, message: `LLM has finally responded!` });
                                            setTimeout(() => {
                                                resolve(response);
                                            }, 1000);
                                        })
                                }
                            })

                            return p;
                        });

                        // Hide the loading div and display the response in the webview
                        panel.webview.postMessage({ command: 'hideLoading' });

                        panel.webview.postMessage({ command: 'receiveResponse', text: promptResponse });
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

// Load the HTML content for the webview panel and inject the CSS and JS file URIs
function getWebViewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    const htmlPath = path.join(context.extensionPath, 'media', 'chat.html');
    const cssPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'chat.css')));
    const jsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'chat.js')));

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('{{cssUri}}', cssPath.toString());
    htmlContent = htmlContent.replace('{{jsUri}}', jsPath.toString());

    return htmlContent;
}

// Function to send an explain prompt to the LLM API
async function sendToLLMExplain(combinedPrompt: string): Promise<string> {
    try {
        const response = await fetch("https://api.arliai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "Meta-Llama-3.1-8B-Instruct",
                "messages": [
                    { "role": "system", "content": "You are a coding assistant. Explain the prompt sent to you in detail." },
                    { "role": "user", "content": combinedPrompt },
                ],
                "repetition_penalty": 1.1,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_tokens": 1024,
                "stream": false
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result: any = await response.json();
        return result.choices[0].message.content;
    } catch (error: any) {
        console.error('Error sending prompt to LLM:', error);
        return `Error: ${error.message}`;
    }
}

// Function to send a code conversion prompt to the LLM API
async function sendToLLMConvert(prompt: string, codeLanguage: string): Promise<string> {
    try {
        const response = await fetch("https://api.arliai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "Meta-Llama-3.1-8B-Instruct",
                "messages": [
                    { "role": "system", "content": `You are a coding assistant. Convert the given code to ${codeLanguage}.` },
                    { "role": "user", "content": prompt },
                ],
                "repetition_penalty": 1.1,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_tokens": 1024,
                "stream": false
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result: any = await response.json();
        return result.choices[0].message.content;
    } catch (error: any) {
        console.error('Error sending prompt to LLM:', error);
        return `Error: ${error.message}`;
    }
}

// Function to send a code review prompt to the LLM API
async function sendToLLMReview(combinedPrompt: string): Promise<string> {
    try {
        const response = await fetch("https://api.arliai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "Meta-Llama-3.1-8B-Instruct",
                "messages": [
                    { "role": "system", "content": "You are a coding assistant. Code review this, and finally send the same code with added comments." },
                    { "role": "user", "content": combinedPrompt },
                ],
                "repetition_penalty": 1.1,
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40,
                "max_tokens": 1024,
                "stream": false
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result: any = await response.json();
        return result.choices[0].message.content;
    } catch (error: any) {
        console.error('Error sending prompt to LLM:', error);
        return `Error: ${error.message}`;
    }
};
