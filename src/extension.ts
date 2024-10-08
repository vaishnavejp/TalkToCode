import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let secretStorage: vscode.SecretStorage;
let panel: vscode.WebviewPanel;
let apiKey: any;

export async function activate(context: vscode.ExtensionContext) {

    secretStorage = context.secrets;
    await secretStorage.store('BEARER_TOKEN', '<YOUR_BEARER_TOKEN>');
    apiKey = await secretStorage.get('BEARER_TOKEN');

    const disposable = vscode.commands.registerCommand('talktocode.talktocode', () => {
        vscode.window.showInformationMessage('Hello from team Code Switch!');

        panel = vscode.window.createWebviewPanel(
            'talktocode',
            'TalkToCode',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const html = getWebViewContent(context, panel);
        panel.webview.html = html;

        const editor = vscode.window.activeTextEditor;

        let selectedText = '';
        if (editor) {
            const selection = editor.selection;
            selectedText = editor.document.getText(selection).trim().toLowerCase();
        }

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'sendPrompt':

                        if (!selectedText) {
                            vscode.window.showErrorMessage("No code selected.");
                        }

                        panel.webview.postMessage({ command: 'showLoading' });

                        const promptResponse = await vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: "I am thinking...",
                            cancellable: true
                        }, async (progress, token) => {
                            token.onCancellationRequested(() => {
                                console.log("User canceled the long running operation");
                            });

                            progress.report({ increment: 0 });
                            for (let i = 0; i < 100; i++) {
                                setTimeout(() => {
                                    progress.report({ increment: 1, message: ` Progress - ${i}` });
                                }, (i + 1) * 1000);
                            }

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


function getWebViewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    const htmlPath = path.join(context.extensionPath, 'media', 'chat.html');
    const cssPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'chat.css')));
    const jsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'chat.js')));

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    htmlContent = htmlContent.replace('{{cssUri}}', cssPath.toString());
    htmlContent = htmlContent.replace('{{jsUri}}', jsPath.toString());

    return htmlContent;
}

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
