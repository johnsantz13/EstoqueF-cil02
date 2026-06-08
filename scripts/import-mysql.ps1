param(
  [string]$User = "root",
  [string]$HostName = "localhost",
  [string]$MysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
)

$schemaPath = Join-Path $PSScriptRoot "..\src\database\mysql_schema.sql"

if (-not (Test-Path -LiteralPath $MysqlPath)) {
  Write-Error "mysql.exe nao encontrado em: $MysqlPath"
  exit 1
}

if (-not (Test-Path -LiteralPath $schemaPath)) {
  Write-Error "Schema MySQL nao encontrado em: $schemaPath"
  exit 1
}

Write-Host "Importando banco estoque_facil no MySQL..."
Write-Host "Usuario: $User"
Write-Host "Host: $HostName"
Write-Host "O MySQL vai solicitar a senha."

& $MysqlPath "-h$HostName" "-u$User" "-p" "--default-character-set=utf8mb4" "--execute=source $schemaPath"

if ($LASTEXITCODE -eq 0) {
  Write-Host "Banco estoque_facil importado com sucesso."
} else {
  Write-Error "Falha ao importar banco. Verifique usuario, senha e se o MySQL Server esta ativo."
}
