// Entry point para Vercel serverless functions
// Este arquivo importa o servidor Express compilado
const server = require('../dist/index.cjs');

// Variável para armazenar o app inicializado
let app = null;
let initPromise = null;

// Função para inicializar o app uma única vez
async function getApp() {
  if (app) {
    return app;
  }
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          app = await server.initializeApp();
          console.log('App initialized for Vercel');
        } else {
          app = server.default || server;
        }
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Stack:', error.stack);
        throw error;
      }
    })();
  }
  
  return await initPromise;
}

// Exporta um handler que aguarda a inicialização
// A Vercel espera uma função que recebe (req, res)
module.exports = async (req, res) => {
  try {
    const initializedApp = await getApp();
    initializedApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

