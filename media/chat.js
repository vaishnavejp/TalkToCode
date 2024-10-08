const vscode = acquireVsCodeApi();

document.getElementById('send').addEventListener('click', () => {
    const prompt = document.getElementById('prompt').value;


    const userMessage = document.createElement('div');
    userMessage.classList.add('user-message');
    userMessage.textContent = prompt;
    
    const output = document.getElementById('output')
    const loadingDivAfterResponse = document.getElementById('loading');

    output.insertBefore(userMessage, loadingDivAfterResponse); // insertBefore(userMessage);
    output.scrollTop = output.scrollHeight;

    document.getElementById('prompt').value = '';

    vscode.postMessage({ command: 'sendPrompt', prompt });
});

window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'receiveResponse') {
        const botMessage = document.createElement('div');
        botMessage.classList.add('bot-message');

        const finalText = formatResponse(message.text);
        botMessage.innerHTML = finalText;

        document.getElementById('output').insertBefore(botMessage, document.getElementById('loading'));
        output.scrollTop = output.scrollHeight;
    } 
    else if(message.command === 'showLoading') {
        document.getElementById('loading').style.display = 'block';
    }
    else if(message.command === 'hideLoading') {
        document.getElementById('loading').style.display = 'none';
    }
});

function formatResponse(response) {
    const formattedText = response.replace(/```([^`]+)```/g, (match, p1) => {
        return `<pre><code>${escapeHtml(p1)}</code></pre>`;
    });
    return formattedText;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
