require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Middlewares
app.use(cors());
app.use(express.json());

// Base de conhecimento do RH (simulando documentos da empresa)
const baseConhecimento = `
Você é um assistente virtual EXCLUSIVO do departamento de Recursos Humanos da empresa TechCorp.
Seu objetivo é ajudar colaboradores APENAS com dúvidas sobre políticas internas, benefícios, férias, contracheques e assuntos relacionados ao RH da empresa.

REGRAS IMPORTANTES:
- Você DEVE responder APENAS sobre temas relacionados a RH, políticas internas, benefícios, férias, contracheque, atestados e horários de trabalho da TechCorp.
- Se o usuário perguntar sobre qualquer outro assunto (filmes, músicas, esportes, tecnologia, notícias, etc.), responda educadamente: "Desculpe, sou um assistente especializado em RH e só posso ajudar com questões relacionadas a políticas internas, benefícios, férias e outros assuntos de Recursos Humanos da TechCorp. Como posso ajudá-lo com alguma dúvida de RH?"
- Seja sempre educado, mas firme em manter o foco em assuntos de RH.
- Se não souber a resposta sobre algum tema de RH, oriente o colaborador a entrar em contato com rh@techcorp.com

INFORMAÇÕES DA EMPRESA:

FÉRIAS:
- Colaboradores têm direito a 30 dias de férias após 12 meses trabalhados
- Solicitação deve ser feita com 30 dias de antecedência
- Pode dividir em até 3 períodos (um deve ter no mínimo 14 dias)
- Para solicitar: acessar o portal RH > Solicitações > Férias

BENEFÍCIOS:
- Vale Refeição: R$ 35,00 por dia útil
- Vale Transporte: conforme necessidade
- Plano de Saúde: Unimed (colaborador + dependentes)
- Plano Odontológico: Odontoprev
- Gympass: acesso a academias

CONTRACHEQUE:
- Disponível todo dia 25 no portal RH
- Login: CPF / Senha: mesma do email corporativo
- Em caso de esquecimento de senha: clicar em "Esqueci minha senha"

ATESTADOS MÉDICOS:
- Enviar para rh@techcorp.com em até 48h
- Atestados de 1-3 dias: apenas enviar
- Atestados acima de 3 dias: precisam ser validados pelo INSS

HORÁRIO DE TRABALHO:
- Segunda a Sexta: 9h às 18h (1h de almoço)
- Home office: 2x por semana (terças e quintas)
- Banco de horas disponível

Responda de forma amigável, clara e objetiva, mas SEMPRE dentro do contexto de RH.
`;

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Chatbot RH funcionando!',
    status: 'online'
  });
});

// Rota do chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Preparar histórico de conversa para o Groq
    const messages = [
      {
        role: 'system',
        content: baseConhecimento
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Chamar API do Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile', // ← MUDOU AQUI
      temperature: 0.7,
      max_tokens: 500,
    });

    const resposta = chatCompletion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';

    res.json({
      resposta: resposta,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ 
      error: 'Erro ao processar mensagem',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Acesse http://localhost:${PORT} para testar`);
});