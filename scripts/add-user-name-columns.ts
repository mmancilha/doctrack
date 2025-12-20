import "dotenv/config";
import { pool } from "../lib/db";

async function addColumns() {
  try {
    console.log("Adicionando colunas first_name e last_name à tabela users...");
    
    const client = await pool.connect();
    
    try {
      // Verificar se as colunas já existem
      const checkFirst = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
      `);
      
      const checkLast = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
      `);
      
      if (checkFirst.rows.length === 0) {
        await client.query('ALTER TABLE users ADD COLUMN first_name TEXT');
        console.log("✓ Coluna first_name adicionada");
      } else {
        console.log("✓ Coluna first_name já existe");
      }
      
      if (checkLast.rows.length === 0) {
        await client.query('ALTER TABLE users ADD COLUMN last_name TEXT');
        console.log("✓ Coluna last_name adicionada");
      } else {
        console.log("✓ Coluna last_name já existe");
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

addColumns();

