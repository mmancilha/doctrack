// Entry point para Vercel serverless functions
// Este arquivo importa o servidor Express compilado

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
        console.log('Starting app initialization...');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
        
        // Importa o servidor apenas quando necessário
        const server = require('../dist/index.cjs');
        
        // Se o servidor exporta uma função de inicialização, chama ela
        if (server.initializeApp) {
          console.log('Calling initializeApp...');
          app = await server.initializeApp();
          console.log('App initialized successfully for Vercel');
        } else {
          console.log('No initializeApp found, using default export');
          app = server.default || server;
        }
        return app;
      } catch (error) {
        console.error('Error initializing app:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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
    return initializedApp(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

