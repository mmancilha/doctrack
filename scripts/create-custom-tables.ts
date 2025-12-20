import "dotenv/config";
import { pool } from "../lib/db";

async function createTables() {
  try {
    console.log("Criando tabelas custom_categories e custom_clients...");
    
    const client = await pool.connect();
    
    try {
      // Verificar se a tabela custom_categories existe
      const checkCategories = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'custom_categories'
      `);
      
      if (checkCategories.rows.length === 0) {
        await client.query(`
          CREATE TABLE custom_categories (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            user_id VARCHAR NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("✓ Tabela custom_categories criada");
      } else {
        console.log("✓ Tabela custom_categories já existe");
      }
      
      // Verificar se a tabela custom_clients existe
      const checkClients = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'custom_clients'
      `);
      
      if (checkClients.rows.length === 0) {
        await client.query(`
          CREATE TABLE custom_clients (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            user_id VARCHAR NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
        console.log("✓ Tabela custom_clients criada");
      } else {
        console.log("✓ Tabela custom_clients já existe");
      }
      
      console.log("Migração concluída com sucesso!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erro ao executar migração:", error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createTables();

