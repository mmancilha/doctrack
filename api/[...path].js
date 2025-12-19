// Handler catch-all para todas as rotas de API
// Captura /api/* e processa com o Express app
// Usa [...path] para capturar todas as rotas de API em uma única função
const { getApp } = require('./_lib/app');

module.exports = async (req, res) => {
  try {
    // CRÍTICO: Quando a Vercel usa catch-all [...path], ela roteia /api/* para este arquivo
    // O req.url pode estar como /auth/login (sem /api) ou /api/auth/login (com /api)
    // Precisamos garantir que sempre tenha o prefixo /api para o Express encontrar a rota
    
    let pathToUse = req.url;
    
    // Se req.url não começa com /api, adicionar o prefixo
    if (!pathToUse.startsWith('/api')) {
      // Adicionar /api no início
      pathToUse = '/api' + (pathToUse.startsWith('/') ? pathToUse : '/' + pathToUse);
    }
    
    // Atualizar req.url e req.originalUrl para o Express
    req.url = pathToUse;
    req.originalUrl = pathToUse;
    
    // Logs para debug
    console.log(`[API Catch-All] ${req.method} ${req.url}`);
    console.log(`[API Catch-All] Original URL: ${req.originalUrl}`);
    console.log(`[API Catch-All] Path: ${req.path}`);
    
    const app = await getApp();
    // Chama o Express app - ele vai processar a rota correta baseado em req.url
    app(req, res);
  } catch (error) {
    console.error('[API Catch-All] Error:', error);
    console.error('[API Catch-All] Error message:', error.message);
    console.error('[API Catch-All] Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

