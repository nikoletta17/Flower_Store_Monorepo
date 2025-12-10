const inputMessage = document.getElementById("inputMessage");
const sendBtn = document.getElementById("sendBtn");
const chatbox = document.getElementById("chatbox");

function appendMessage(text, sender) {
   const msgDiv = document.createElement("div");
   msgDiv.classList.add("message", sender);

   const textBubble = document.createElement("span");
   textBubble.classList.add("text-bubble");
   textBubble.textContent = text;

   if (sender == "bot") {
      const iconImg = document.createElement("img");
      iconImg.src = "logo.jpg";
      iconImg.classList.add("bot-chat-logo");
      iconImg.alt = alt = "Bot Logo";
      msgDiv.appendChild(iconImg);
   }

   msgDiv.appendChild(textBubble);
   chatbox.appendChild(msgDiv);
   //Multiple messages scroll!

   chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
   const message = inputMessage.value.trim();

   if (!message) return;
   appendMessage(message, "user");
   inputMessage.value = "";
   //wait for the reply of the bot!
   sendBtn.disabled = true;

   try {
      // 1. ВИПРАВЛЕНО: ЗМІНЕНО URL на коректний: /ai/chat/
      const response = await fetch("http://127.0.0.1:8000/ai/chat/", { 
         method: 'POST',
         headers: { 'Content-type': 'application/json' },
         // Вміст запиту (body) правильний: { "message": "..." }
         body: JSON.stringify({ message })
      })

      if (!response.ok) throw new Error("Network response wasn't okay");

      const data = await response.json();
      
      // 2. ВИПРАВЛЕНО: ЗМІНЕНО data.reply на data.response
      appendMessage(data.response, "bot"); 

   }
   catch (error) {
      appendMessage("Error: Couldn't reach the server!", "bot")
   }
   finally {
      sendBtn.disabled = false;
      inputMessage.focus();
   }


}

sendBtn.addEventListener("click", sendMessage);
inputMessage.addEventListener("keypress", e => {
   if (e.key == "Enter") sendMessage();
})