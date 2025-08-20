<!-- Banner premium SVG topo do README.md -->
<p align="center">
  <svg width="100%" height="120" viewBox="0 0 900 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lajepremium" x1="0" y1="0" x2="900" y2="120" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0369a1"/>
        <stop offset="0.5" stop-color="#38bdf8"/>
        <stop offset="1" stop-color="#7f9cf5"/>
      </linearGradient>
      <filter id="shadow" x="-10" y="0" width="920" height="140" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="10" stdDeviation="6" flood-color="#22222255"/>
      </filter>
    </defs>
    <rect width="900" height="100" rx="30" fill="url(#lajepremium)" filter="url(#shadow)" />
    <!-- Ícone de engenharia estilizado (capacete + régua) -->
    <g>
      <circle cx="70" cy="60" r="32" fill="#fff" stroke="#0ea5e9" stroke-width="4"/>
      <rect x="59" y="65" width="22" height="8" rx="3" fill="#0ea5e9"/>
      <rect x="86" y="53" width="9" height="9" rx="2" fill="#7f9cf5" transform="rotate(35 86 53)"/>
      <rect x="52" y="48" width="36" height="6" rx="2" fill="#7f9cf5" transform="rotate(-10 52 48)"/>
      <rect x="68" y="76" width="4" height="15" rx="2" fill="#38bdf8"/>
    </g>
    <text x="130" y="70" font-size="44" font-family="Segoe UI, Arial, sans-serif" font-weight="bold" fill="#fff" filter="url(#shadow)">
      Calculadora Premium de Lajes
    </text>
    <text x="132" y="98" font-size="22" font-family="Segoe UI, Arial, sans-serif" fill="#e0f2fe">
      Engenharia Estrutural com Automação &mdash; Next.js + React + TailwindCSS
    </text>
  </svg>
</p>

# appengweb

Projeto Next.js iniciado com create-next-app.

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha os valores conforme seu ambiente.

## Uso

Rode o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para ver o resultado. 
Você pode começar a editar modificando `src/app/page.tsx`. As alterações são aplicadas automaticamente.

## Testes

Execute a suíte de testes:

```bash
npm test
```

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b minha-feature`).
3. Commit suas alterações (`git commit -m 'Minha feature'`).
4. Envie para o GitHub (`git push origin minha-feature`) e abra um Pull Request.

---

Desenvolvido por Eng. Joanez Gaspar – CREA 1234567 D

<p align="center">
  <img alt="Engenheiro Joanez Gaspar" src="https://img.shields.io/badge/%F0%9F%91%B7%20Eng.%20Joanez%20Gaspar-1234567%20D%20CREA-38bdf8?style=for-the-badge&color=0369a1&labelColor=27272a">
</p>
