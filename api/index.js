// Entry point para Vercel serverless functions
// Este arquivo importa o servidor Express compilado
const server = require('../dist/index.cjs');

// Se o servidor exporta uma função de inicialização, chama ela
if (server.initializeApp) {
  server.initializeApp().then(() => {
    console.log('App initialized for Vercel');
  }).catch(console.error);
}

// Exporta o app Express
module.exports = server.default || server;

