# Script para limpar caches e reinstalar dependências

# Apaga a pasta .next
if (Test-Path .next) {
    Write-Host "Removendo pasta .next..."
    Remove-Item -Recurse -Force .next
} else {
    Write-Host "Pasta .next não encontrada."
}

# Apaga a pasta node_modules
if (Test-Path node_modules) {
    Write-Host "Removendo pasta node_modules..."
    Remove-Item -Recurse -Force node_modules
} else {
    Write-Host "Pasta node_modules não encontrada."
}

# Apaga package-lock.json e yarn.lock se existirem
if (Test-Path package-lock.json) {
    Write-Host "Removendo package-lock.json..."
    Remove-Item package-lock.json -Force
} else {
    Write-Host "Arquivo package-lock.json não encontrado."
}

if (Test-Path yarn.lock) {
    Write-Host "Removendo yarn.lock..."
    Remove-Item yarn.lock -Force
} else {
    Write-Host "Arquivo yarn.lock não encontrado."
}

# Reinstala dependências npm
Write-Host "Reinstalando dependências..."
npm install

Write-Host "Limpeza e instalação concluídas. Execute 'npm run dev' para iniciar o servidor."
