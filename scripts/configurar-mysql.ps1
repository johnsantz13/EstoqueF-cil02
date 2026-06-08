$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $projectRoot ".env"

Write-Host ""
Write-Host "Configuracao do MySQL para o Estoque Facil" -ForegroundColor Cyan
Write-Host "Use os mesmos dados da conexao que voce usa no MySQL Workbench."
Write-Host ""

$hostName = Read-Host "Host do MySQL [localhost]"
if ([string]::IsNullOrWhiteSpace($hostName)) { $hostName = "localhost" }

$port = Read-Host "Porta do MySQL [3306]"
if ([string]::IsNullOrWhiteSpace($port)) { $port = "3306" }

$user = Read-Host "Usuario do MySQL [root]"
if ([string]::IsNullOrWhiteSpace($user)) { $user = "root" }

$securePassword = Read-Host "Senha do MySQL" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

$database = Read-Host "Nome do banco [estoque_facil]"
if ([string]::IsNullOrWhiteSpace($database)) { $database = "estoque_facil" }

$envContent = @"
PORT=3000
APP_SECRET=troque-esta-chave-em-producao
MYSQL_HOST=$hostName
MYSQL_PORT=$port
MYSQL_USER=$user
MYSQL_PASSWORD=$plainPassword
MYSQL_DATABASE=$database
"@

Set-Content -LiteralPath $envPath -Value $envContent -Encoding UTF8

Write-Host ""
Write-Host "Arquivo .env criado em:" -ForegroundColor Green
Write-Host $envPath
Write-Host ""
Write-Host "Criando banco e tabelas..." -ForegroundColor Cyan

Push-Location $projectRoot
try {
  npm.cmd run db:init
  Write-Host ""
  Write-Host "Banco configurado com sucesso." -ForegroundColor Green
  Write-Host "Agora rode: npm start"
} finally {
  Pop-Location
}
