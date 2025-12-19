// Handler catch-all para todas as rotas de API
// Captura /api/* e processa com o Express app
// Usa [...path] para capturar todas as rotas de API em uma única função
const { getApp } = require('./_lib/app');

module.exports = async (req, res) => {
  try {
    // Quando a Vercel usa catch-all [...path], ela roteia /api/* para este arquivo
    // O req.url já deve conter o path completo (ex: /api/auth/login)
    // Mas vamos garantir que está correto e logar para debug
    
    // Se req.url não começa com /api, pode ser que o path foi capturado sem o prefixo
    // Nesse caso, reconstruir adicionando /api
    if (!req.url.startsWith('/api')) {
      // Se o path não começa com /api, adicionar o prefixo
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      req.originalUrl = req.url;
    }
    
    // Logs para debug
    console.log(`[API Catch-All] ${req.method} ${req.url}`);
    console.log(`[API Catch-All] Original URL: ${req.originalUrl || req.url}`);
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

