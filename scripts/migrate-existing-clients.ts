import "dotenv/config";
import { pool } from "../lib/db";

async function migrateClients() {
  try {
    console.log("Migrando clientes existentes para custom_clients...");
    
    const client = await pool.connect();
    
    try {
      // Buscar todos os clientes únicos dos documentos
      const documentsResult = await client.query(`
        SELECT DISTINCT company, author_id as user_id
        FROM documents
        WHERE company IS NOT NULL AND company != ''
      `);
      
      console.log(`Encontrados ${documentsResult.rows.length} clientes únicos nos documentos`);
      
      let migrated = 0;
      let skipped = 0;
      
      for (const row of documentsResult.rows) {
        const clientName = row.company;
        const userId = row.user_id;
        
        // Verificar se já existe na tabela custom_clients
        const existing = await client.query(`
          SELECT id FROM custom_clients 
          WHERE name = $1 AND user_id = $2
        `, [clientName, userId]);
        
        if (existing.rows.length === 0) {
          // Criar entrada na tabela custom_clients
          await client.query(`
            INSERT INTO custom_clients (name, user_id, created_at)
            VALUES ($1, $2, NOW())
          `, [clientName, userId]);
          console.log(`✓ Migrado: ${clientName} (usuário: ${userId})`);
          migrated++;
        } else {
          console.log(`- Já existe: ${clientName} (usuário: ${userId})`);
          skipped++;
        }
      }
      
      console.log(`\nMigração concluída!`);
      console.log(`- Migrados: ${migrated}`);
      console.log(`- Já existiam: ${skipped}`);
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

migrateClients();

