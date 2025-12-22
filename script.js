const input = document.getElementById("input");
const send = document.getElementById("send");
const chat = document.getElementById("chat");

function addMessage(text, who = "user") {
  const div = document.createElement("div");
  div.className = "message " + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

send.onclick = () => {
  if (!input.value.trim()) return;
  addMessage(input.value, "user");
  addMessage("Te escucho.", "lucy");
  input.value = "";
};