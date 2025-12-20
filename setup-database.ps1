# Script para configurar o banco de dados PostgreSQL usando Docker
# Execute este script no PowerShell: .\setup-database.ps1

Write-Host "=== Configuração do Banco de Dados DocTrack ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker não está instalado!" -ForegroundColor Red
    Write-Host "Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Docker encontrado" -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker ps | Out-Null
    Write-Host "✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop não está rodando!" -ForegroundColor Red
    Write-Host "Por favor, inicie o Docker Desktop e execute este script novamente." -ForegroundColor Yellow
    exit 1
}

# Verificar se o container já existe
$containerExists = docker ps -a --filter "name=doctrack-db" --format "{{.Names}}" | Select-String "doctrack-db"
if ($containerExists) {
    Write-Host "Container 'doctrack-db' já existe. Verificando status..." -ForegroundColor Yellow
    
    $containerStatus = docker ps --filter "name=doctrack-db" --format "{{.Status}}"
    if ($containerStatus) {
        Write-Host "✓ Container já está rodando" -ForegroundColor Green
    } else {
        Write-Host "Iniciando container existente..." -ForegroundColor Yellow
        docker start doctrack-db
        Start-Sleep -Seconds 3
        Write-Host "✓ Container iniciado" -ForegroundColor Green
    }
} else {
    Write-Host "Criando novo container PostgreSQL..." -ForegroundColor Yellow
    docker run --name doctrack-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=doctrack -p 5432:5432 -d postgres:14
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Container criado com sucesso!" -ForegroundColor Green
        Write-Host "Aguardando PostgreSQL inicializar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "❌ Erro ao criar container" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Próximos passos ===" -ForegroundColor Cyan
Write-Host "1. Aplicar schema do banco: npm run db:push" -ForegroundColor White
Write-Host "2. Popular com dados de teste: npx tsx server/seed.ts" -ForegroundColor White
Write-Host "3. Iniciar servidor: npm run dev" -ForegroundColor White
Write-Host ""

