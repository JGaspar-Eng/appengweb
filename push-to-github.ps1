# push-to-github.ps1
# Execute na raiz do repo: C:\Users\joane\Desktop\appengweb\appengweb
# Usuário / repo embutido: JGaspar-Eng/appengweb

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoName = "appengweb"
$ghUser = "JGaspar-Eng"
$expectedRemote = "https://github.com/$ghUser/$repoName.git"
$cwd = (Get-Location).Path
Write-Host "Pasta atual: $cwd"

# 0) Garantir que estamos na raiz (opcional)
if (-not (Test-Path ".git")) {
  Write-Host "Nenhum repositório git encontrado nesta pasta. Abortando." -ForegroundColor Yellow
  exit 1
}

# 1) Checagem: arquivos .dxf/.dwg versionados
Write-Host "`n1) Verificando arquivos .dxf/.dwg versionados..."
$filesDXF = git ls-files '*.dxf' 2>$null
$filesDWG = git ls-files '*.dwg' 2>$null
if ($filesDXF -or $filesDWG) {
  Write-Host "ATENÇÃO: arquivos CAD ainda indexados:"
  if ($filesDXF) { $filesDXF | ForEach-Object { Write-Host "  .dxf -> $_" } }
  if ($filesDWG) { $filesDWG | ForEach-Object { Write-Host "  .dwg -> $_" } }
  Write-Host "`nRemovendo esses arquivos do índice (mantendo locais)..."
  @( $filesDXF, $filesDWG ) | Where-Object { $_ } | ForEach-Object {
    git rm --cached --force -- $_ | Out-Null
  }
} else {
  Write-Host "OK: nenhum .dxf/.dwg versionado encontrado."
}

# 2) Garantir .gitignore com regras CAD
Write-Host "`n2) Atualizando .gitignore (adicionando *.dxf, *.dwg se necessário)..."
$gi = Get-Content -Path .gitignore -ErrorAction SilentlyContinue -Raw
if (-not $gi) { $gi = "" }
if ($gi -notmatch '\*\.dxf') {
  Add-Content .gitignore "`n# Ignorar desenhos CAD"
  Add-Content .gitignore "*.dxf"
  Add-Content .gitignore "*.dwg"
  Write-Host ".gitignore atualizado com *.dxf e *.dwg"
} else {
  Write-Host ".gitignore já contém regra para *.dxf"
}

# 3) Adicionar e commitar mudanças (se houver)
Write-Host "`n3) Preparando commit..."
git add -A
$st = git status --porcelain
if ($st) {
  git commit -m "Remove .dxf/.dwg do índice e adiciona ao .gitignore"
  Write-Host "Commit criado."
} else {
  Write-Host "Sem mudanças a commitar."
}

# 4) Conferir remote origin e ajustar se necessário
Write-Host "`n4) Verificando remote origin..."
$existingRemote = (& git remote get-url origin 2>$null) -join ""
if ($existingRemote) {
  if ($existingRemote -ne $expectedRemote) {
    Write-Host "Remote 'origin' aponta para: $existingRemote`nAtualizando para: $expectedRemote"
    git remote set-url origin $expectedRemote
  } else {
    Write-Host "Remote 'origin' já aponta para $expectedRemote"
  }
} else {
  Write-Host "Adicionando remote origin -> $expectedRemote"
  git remote add origin $expectedRemote
}

# 5) Push para origin/main
Write-Host "`n5) Enviando para origin/main..."
git branch -M main 2>$null
git push -u origin main

Write-Host "`nPronto — push concluído. Repositório: https://github.com/$ghUser/$repoName" -ForegroundColor Green

# Abrir repo no navegador (opcional)
if ($Host.UI.RawUI.KeyAvailable -eq $false) {
  Write-Host "Abrindo repositório no navegador..."
  Start-Process "https://github.com/$ghUser/$repoName"
}
