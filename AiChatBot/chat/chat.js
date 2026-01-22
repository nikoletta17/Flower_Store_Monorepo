/* AiChatBot/chat/chat.js */

const inputMessage = document.getElementById("inputMessage");
const sendBtn = document.getElementById("sendBtn");
const chatbox = document.getElementById("chatbox");

/**
 * Додає повідомлення в чат
 * @param {string} text - Текст повідомлення
 * @param {string} sender - 'user' або 'bot'
 */
function appendMessage(text, sender) {
    if (!text) return;

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    // Створення аватарки для бота
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

    // Плавний скрол до останнього повідомлення
    chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth'
    });
}

/**
 * Відправка повідомлення на сервер
 */
async function sendMessage() {
    const message = inputMessage.value.trim();

    // Перевірка на порожнє повідомлення
    if (!message) return;

    // Відображаємо повідомлення користувача
    appendMessage(message, "user");
    inputMessage.value = "";
    
    // Блокуємо кнопку на час очікування відповіді
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
        
        // Використовуємо data.response, як ти вказала
        if (data && data.response) {
            appendMessage(data.response, "bot");
        } else {
            appendMessage("Бот отримав порожню відповідь.", "bot");
        }

    } catch (error) {
        console.error("Chat Error:", error);
        appendMessage("Помилка: Не вдалося зв'язатися з сервером!", "bot");
    } finally {
        // Розблоковуємо кнопку та повертаємо фокус на інпут
        sendBtn.disabled = false;
        inputMessage.focus();
    }
}

// Слухачі подій
sendBtn.addEventListener("click", sendMessage);

inputMessage.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Фокусуємося на полі вводу при завантаженні сторінки
window.onload = () => inputMessage.focus();