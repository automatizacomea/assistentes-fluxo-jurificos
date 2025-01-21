const internalPrompts = [
  { name: "Assistente Geral", content: "Você é um assistente AI geral, pronto para ajudar com diversas tarefas." },
  {
    name: "Especialista em Programação",
    content:
      "Você é um especialista em programação, focado em ajudar com questões de código e desenvolvimento de software.",
  },
  {
    name: "Consultor de Negócios",
    content:
      "Você é um consultor de negócios experiente, oferecendo conselhos sobre estratégia, gestão e empreendedorismo.",
  },
  {
    name: "Tutor de Matemática",
    content: "Você é um tutor de matemática, especializado em explicar conceitos matemáticos e resolver problemas.",
  },
  {
    name: "Assistente de Escrita",
    content: "Você é um assistente de escrita, ajudando com redação, gramática e estilo literário.",
  },
]

const conversationHistory = []

// Carrega os prompts
function loadPrompts() {
  const promptSelect = document.getElementById("promptSelect")
  promptSelect.innerHTML = '<option value="">Selecione um prompt</option>'
  internalPrompts.forEach((prompt, index) => {
    const option = document.createElement("option")
    option.value = index
    option.textContent = prompt.name
    promptSelect.appendChild(option)
  })
}

// Envia mensagem para o bot
async function sendMessage() {
  const userInput = document.getElementById("userInput")
  const message = userInput.value.trim()
  if (!message) return

  addMessageToChat("user", message)
  userInput.value = ""

  const selectedPromptIndex = document.getElementById("promptSelect").value
  if (!selectedPromptIndex) {
    addMessageToChat("bot", "Por favor, selecione um prompt antes de iniciar a conversa.")
    return
  }

  const selectedPrompt = internalPrompts[selectedPromptIndex]

  conversationHistory.push({
    role: "user",
    content: message,
  })

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${document.getElementById("apiKey").value}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: selectedPrompt.content,
          },
          ...conversationHistory,
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message)
    }

    const botResponse = data.choices[0].message.content
    conversationHistory.push({
      role: "assistant",
      content: botResponse,
    })
    addMessageToChat("bot", botResponse)
  } catch (error) {
    addMessageToChat("bot", `Erro: ${error.message}`)
  }
}

// Adiciona mensagem ao chat
function addMessageToChat(role, content) {
  const chatMessages = document.getElementById("chatMessages")
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${role}-message`
  messageDiv.textContent = content
  chatMessages.appendChild(messageDiv)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

// Event listeners
document.getElementById("sendMessage").addEventListener("click", sendMessage)
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage()
  }
})

// Carrega os prompts quando a página é carregada
document.addEventListener("DOMContentLoaded", loadPrompts)
