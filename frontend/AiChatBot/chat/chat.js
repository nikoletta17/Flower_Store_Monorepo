const inputMessage = document.getElementById("inputMessage");
const sendBtn = document.getElementById("sendBtn");
const chatbox = document.getElementById("chatbox");

/**
 * Add message to the chatbox
 * @param {string} text - The text of the message
 * @param {string} sender - 'user' or 'bot'
 */
function appendMessage(text, sender) {
    if (!text) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    // Bot's image logo
    if (sender === "bot") {
        const iconImg = document.createElement("img");
        iconImg.src = "logo.jpg";
        iconImg.classList.add("bot-chat-logo");
        iconImg.alt = "Bot Logo";
        msgDiv.appendChild(iconImg);
    }

    const textBubble = document.createElement("span");
    textBubble.classList.add("text-bubble");
    textBubble.textContent = text;

    msgDiv.appendChild(textBubble);
    chatbox.appendChild(msgDiv);

    // Smooth scroll to the latest message
    chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Send message to the server
 */
async function sendMessage() {
    const message = inputMessage.value.trim();

    // Check for empty message
    if (!message) return;

    // Display user's message in the chatbox
    appendMessage(message, "user");
    inputMessage.value = "";
    
    // Block the button while waiting for a response
    sendBtn.disabled = true;

    try {
        const response = await fetch("http://127.0.0.1:8000/ai/chat/", { 
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error("Помилка мережі");
        }

        const data = await response.json();
   
        if (data && data.response) {
            appendMessage(data.response, "bot");
        } else {
            appendMessage("Бот отримав порожню відповідь.", "bot");
        }

    } catch (error) {
        console.error("Chat Error:", error);
        appendMessage("Помилка: Не вдалося зв'язатися з сервером!", "bot");
    } finally {
        sendBtn.disabled = false;
        inputMessage.focus();
    }
}


sendBtn.addEventListener("click", sendMessage);

inputMessage.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Focus the input field when the page loads
window.onload = () => inputMessage.focus();