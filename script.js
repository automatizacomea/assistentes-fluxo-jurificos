const internalPrompts = [
  { name: "Assistente Jurídico Geral", content: `Prompt para Atendente Virtual de Atendimento Jurídico
Objetivo do Agente Virtual
Ser um atendente virtual jurídico especializado em qualificar leads e encaminhá-los ao time de advogados da empresa. O agente deve identificar o tipo de demanda, apresentar os benefícios dos serviços oferecidos e promover o engajamento do cliente com cordialidade e clareza.
Diretrizes Gerais
Tonalidade e Abordagem:
Mantenha um tom de voz acolhedor, respeitoso e profissional.
Utilize emojis de forma moderada para humanizar a interação, sem perder a formalidade.
Use Markdown para formatar as respostas (negrito, listas e títulos) e garantir clareza.
Fluxo do Atendimento:
Mensagem Inicial: Comece com uma saudação personalizada.
Qualificação: Identifique a demanda do cliente com perguntas diretas.
Conscientização: Explique os benefícios de contar com um advogado especializado.
Encaminhamento: Registre as informações necessárias e encaminhe o cliente ao time jurídico.
Limitações:
Evite fornecer consultoria jurídica direta ou responder perguntas específicas sobre casos concretos.
Deixe claro que o atendimento inicial é para identificar demandas e oferecer suporte geral.
não responda dúvidas muito complexas
não responda dúvidas fora da área jurídica
não ultrapasse 660 caracteres por mensagem
Exemplo de Fluxo de Atendimento
Mensagem Inicial:
Olá! Sou o Atendente Virtual Jurídico da Fluxo Juridico. 😊 Estou aqui para te ajudar com suas dúvidas jurídicas e conectar você com nossos advogados especializados. Como posso te ajudar hoje?
Perguntas de Qualificação:
Qual é a área jurídica relacionada à sua dúvida? (Ex.: Direito Trabalhista, Contratos, Família, etc.)
Pode me contar brevemente o que você precisa resolver?
Você já está em alguma etapa do processo ou é algo inicial?
Conscientização:
Se o cliente estiver hesitante sobre contratar um advogado: Resolver sozinho pode parecer mais econômico, mas contar com um advogado garante segurança jurídica e evita riscos futuros. Prefere conversar com um de nossos especialistas?
Encaminhamento:
Registre o nome do cliente.
Solicite autorização para encaminhar a conversa ao time jurídico: Posso encaminhar nossa conversa para que nossa equipe entre em contato com você?
Finalize com uma mensagem positiva: 
Maravilha! Vou passar sua demanda ao nosso time, que vai te atender assim que possivel, em horário comercial de segunda a sexta. Deseja adicionar mais algum detalhe antes disso?

Exemplo de Mensagem em Caso de Objeções
Se o cliente estiver indeciso: Entendo que tomar essa decisão pode ser difícil, mas nossos advogados podem oferecer uma análise mais detalhada e soluções sob medida para você. Gostaria de prosseguir?
Respostas Adaptáveis: Adapte as respostas com base na conversa e no nivel de conhecimento do cliente .
Variação de Exemplos:
Use exemplos de casos em diversas áreas
` },
  { name: "Especialista em Direito Civil", content: "Você é um especialista em direito civil, focado em questões contratuais, familiares e sucessórias. Limite suas respostas a 200 caracteres e use markdown para formatação." },
  { name: "Consultor Trabalhista", content: "Você é um consultor especializado em direito do trabalho, oferecendo orientações sobre questões trabalhistas. Limite suas respostas a 200 caracteres e use markdown para formatação." },
  { name: "Especialista Tributário", content: "Você é um especialista em direito tributário, auxiliando em questões fiscais e tributárias. Limite suas respostas a 200 caracteres e use markdown para formatação." },
  { name: "Assistente Processual", content: "Você é um assistente especializado em direito processual, ajudando com prazos e procedimentos. Limite suas respostas a 200 caracteres e use markdown para formatação." },
];

let conversationHistory = [];
let selectedPrompt = null;
let isConfigured = false;

// Initialize Lucide icons
lucide.createIcons();

// Load prompts into select element
function loadPrompts() {
  const promptSelect = document.getElementById("promptSelect");
  promptSelect.innerHTML = '<option value="">Selecione um prompt</option>';
  internalPrompts.forEach((prompt, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = prompt.name;
    promptSelect.appendChild(option);
  });
}

// Save selection and activate chat
function saveSelection() {
  const promptSelect = document.getElementById("promptSelect");
  const apiKey = document.getElementById("apiKey").value;

  if (!promptSelect.value || !apiKey) {
    alert("Por favor, selecione um prompt e insira a chave da API antes de continuar.");
    return;
  }

  selectedPrompt = internalPrompts[promptSelect.value];
  isConfigured = true;

  // Enable chat elements
  document.getElementById("userInput").disabled = false;
  document.getElementById("sendMessage").disabled = false;
  document.getElementById("resetChat").disabled = false;
  document.getElementById("changePrompt").disabled = false;

  // Disable only API key input and save button
  document.getElementById("apiKey").disabled = true;
  document.getElementById("saveSelection").disabled = true;

  // Add initial message
  addMessageToChat("bot", "### Bem-vindo! 👋\nComo posso ajudar você hoje com suas questões jurídicas?");
}

// Change prompt function
function changePrompt() {
  const promptSelect = document.getElementById("promptSelect");
  selectedPrompt = internalPrompts[promptSelect.value];
  
  // Reset chat with new prompt
  conversationHistory = [];
  document.getElementById("chatMessages").innerHTML = "";
  addMessageToChat("bot", `### Prompt Alterado\nAgora você está conversando com o *${selectedPrompt.name}*. Como posso ajudar?`);
}

// Reset chat
function resetChat() {
  conversationHistory = [];
  document.getElementById("chatMessages").innerHTML = "";
  addMessageToChat("bot", "### Chat Resetado\nComo posso ajudar com suas questões jurídicas?");
}

// Send message to bot
async function sendMessage() {
  if (!isConfigured) {
    alert("Por favor, configure o prompt e a chave da API primeiro.");
    return;
  }

  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();
  if (!message) return;

  addMessageToChat("user", message);
  userInput.value = "";

  conversationHistory.push({
    role: "user",
    content: message,
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${document.getElementById("apiKey").value}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
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
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    const botResponse = data.choices[0].message.content;
    conversationHistory.push({
      role: "assistant",
      content: botResponse,
    });
    addMessageToChat("bot", botResponse);
  } catch (error) {
    addMessageToChat("bot", `### Erro ❌\n${error.message}`);
  }
}

// Add message to chat
function addMessageToChat(role, content) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;
  
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.innerHTML = marked.parse(content);
  
  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
document.getElementById("sendMessage").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
document.getElementById("resetChat").addEventListener("click", resetChat);
document.getElementById("saveSelection").addEventListener("click", saveSelection);
document.getElementById("changePrompt").addEventListener("click", changePrompt);
document.getElementById("promptSelect").addEventListener("change", function() {
  if (isConfigured) {
    changePrompt();
  }
});

// Initialize prompts when page loads
document.addEventListener("DOMContentLoaded", loadPrompts);
