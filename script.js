const internalPrompts = [
  { name: "Assistente Geral Juridica", content: "Você é um assistente AI geral do setor Juridico, pronto para ajudar com diversas tarefas relacionadas ao setor." },
  {
    name: "Especialista em Direito Civil",
    content:
      "Você é um especialista em Direito Civil, capacitado para lidar com questões de contratos, obrigações, responsabilidade civil, direito de família e sucessões.",
  },
  {
    name: "Especialista em Direito Penal",
    content:
      "Você é um especialista em Direito Penal, focado em crimes, legislação penal, e análise de casos relacionados à proteção da ordem social e dos direitos individuais.",
  },
  {
    name: "Especialista em Direito Trabalhista",
    content: "Você é um especialista em Direito Trabalhista, preparado para auxiliar em questões sobre direitos dos trabalhadores, contratos de trabalho, condições laborais e rescisões contratuais.",
  },
  {
    name: "Especialista em Direito Constitucional",
    content: "Você é um especialista em Direito Constitucional, oferecendo suporte relacionado aos direitos fundamentais, organização do Estado e interpretação da Constituição.",
  },
]

let conversationHistory = []
let selectedPrompt = null
let isConfigured = false

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

// Salva a seleção e ativa o chat
function saveSelection() {
  const promptSelect = document.getElementById("promptSelect")
  const apiKey = document.getElementById("apiKey").value

  if (!promptSelect.value || !apiKey) {
    alert("Por favor, selecione um prompt e insira a chave da API antes de continuar.")
    return
  }

  selectedPrompt = internalPrompts[promptSelect.value]
  isConfigured = true

  // Ativa os elementos do chat
  document.getElementById("userInput").disabled = false
  document.getElementById("sendMessage").disabled = false
  document.getElementById("resetChat").disabled = false

  // Desativa os elementos de configuração
  promptSelect.disabled = true
  document.getElementById("apiKey").disabled = true
  document.getElementById("saveSelection").disabled = true

  // Adiciona mensagem inicial
  addMessageToChat("bot", "Olá! Como posso ajudar você hoje?")
}

// Reseta a conversa
function resetChat() {
  conversationHistory = []
  document.getElementById("chatMessages").innerHTML = ""
  addMessageToChat("bot", "Conversa resetada. Como posso ajudar?")
}

// Envia mensagem para o bot
async function sendMessage() {
  if (!isConfigured) {
    alert("Por favor, salve a seleção do prompt e API key primeiro.")
    return
  }

  const userInput = document.getElementById("userInput")
  const message = userInput.value.trim()
  if (!message) return

  addMessageToChat("user", message)
  userInput.value = ""

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
document.getElementById("resetChat").addEventListener("click", resetChat)
document.getElementById("saveSelection").addEventListener("click", saveSelection)

// Inicializa os prompts quando a página carregar
document.addEventListener("DOMContentLoaded", loadPrompts)
