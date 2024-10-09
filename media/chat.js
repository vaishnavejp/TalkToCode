// Acquire the VS Code API to communicate between the webview and the extension
const vscode = acquireVsCodeApi();

// Add an event listener for the "Send" button click
document.getElementById('send').addEventListener('click', () => {

    // Get the prompt value from the input field
    const prompt = document.getElementById('prompt').value;

    // Create a new div element to display the user's message
    const userMessage = document.createElement('div');
    userMessage.classList.add('user-message');
    userMessage.textContent = prompt;
    
    const output = document.getElementById('output')
    const loadingDivAfterResponse = document.getElementById('loading');

    // Insert the user's message before the loading div to display it in the output
    output.insertBefore(userMessage, loadingDivAfterResponse);
    output.scrollTop = output.scrollHeight;

    // Clear the input field after sending the message
    document.getElementById('prompt').value = '';

    // Post a message to the extension with the prompt text
    vscode.postMessage({ command: 'sendPrompt', prompt });
});

// Event listener to handle incoming messages from the extension
window.addEventListener('message', event => {
    const message = event.data;

    // Handle the response from the extension (e.g., when the bot replies)
    if (message.command === 'receiveResponse') {

        // Create a new div element to display the bot's response
        const botMessage = document.createElement('div');
        botMessage.classList.add('bot-message');

        const finalText = formatResponse(message.text);
        botMessage.innerHTML = finalText;

        document.getElementById('output').insertBefore(botMessage, document.getElementById('loading'));
        output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom of the output
    } 
    // Show the loading div when waiting for a response
    else if(message.command === 'showLoading') {
        document.getElementById('loading').style.display = 'block';
    }
    // Hide the loading once the response is received
    else if(message.command === 'hideLoading') {
        document.getElementById('loading').style.display = 'none';
    }
});

// Function to format the response and handle code blocks within triple backticks
function formatResponse(response) {
    const formattedText = response.replace(/```([^`]+)```/g, (match, p1) => {
        return `<pre><code>${escapeHtml(p1)}</code></pre>`;
    });
    return formattedText;
}

// Function to escape HTML characters for safe display in the browser
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
