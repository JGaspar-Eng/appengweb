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


appengweb
Este é um projeto Next.js bootstrapped com create-next-app.

🚀 Primeiros Passos
Rode o servidor de desenvolvimento:

bash

npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev

Abra http://localhost:3000 no navegador para ver o resultado.

Você pode começar a editar a página modificando app/page.tsx. A página é atualizada automaticamente conforme você salva o arquivo.

Este projeto utiliza next/font para otimizar e carregar automaticamente a fonte Geist, da Vercel.

📚 Saiba Mais
Documentação do Next.js

Aprenda Next.js (tutorial interativo)

Repositório Next.js no GitHub

🗂️ Estrutura do Projeto

O ChatGPT disse:
Segue o arquivo README.md atualizado conforme a nova estrutura de arquivos que você enviou, mantendo o padrão e linguagem profissional, com a organização correta e assinatura:

md
Copiar
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

Este é um projeto Next.js bootstrapped com create-next-app.

---

## 🚀 Primeiros Passos

Rode o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
Abra http://localhost:3000 no navegador para ver o resultado.

Você pode começar a editar a página modificando src/app/page.tsx. A página é atualizada automaticamente conforme você salva o arquivo.

Este projeto utiliza next/font para otimizar e carregar automaticamente a fonte Geist, da Vercel.

📚 Saiba Mais
Documentação do Next.js

Aprenda Next.js (tutorial interativo)

Repositório Next.js no GitHub

🗂️ Estrutura do Projeto

appengweb/
│
├── .next/                      # Build do Next.js (gerada automaticamente)
├── node_modules/               # Dependências (gerado pelo npm)
├── public/                     # Arquivos públicos (favicon, imagens, fontes, etc.)
│   ├── fonts/                  # Fontes personalizadas (Montserrat, Abel)
│   ├── logo-simettria-clean.svg
│   ├── logo-simettria-dark.svg
│   └── ...                    # Outros arquivos estáticos
├── src/                        # Código fonte principal
│   ├── app/
│   │   ├── calculadoras/
│   │   │   └── page.tsx        # Página das calculadoras estruturais
│   │   ├── components/
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ThemeSwitcher.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard premium (cards principais)
│   │   ├── lajes/
│   │   │   ├── balanco/        # Em desenvolvimento
│   │   │   ├── biapoiada/
│   │   │   │   └── page.tsx    # Página da laje biapoiada
│   │   │   └── continua/
│   │   │       └── page.tsx    # Página da laje contínua
│   │   ├── login/
│   │   │   └── page.tsx        # Página de login premium
│   │   ├── logout/
│   │   │   └── page.tsx        # Logout (limpa sessão)
│   │   ├── restricted/
│   │   │   └── page.tsx        # Página restrita para testes
│   │   ├── favicon.ico
│   │   ├── globals.css         # Estilos globais (Tailwind, variáveis CSS)
│   │   ├── layout.tsx          # Layout base do app com providers
│   │   └── page.tsx            # Página inicial (boas vindas)
│   ├── components/             # Componentes reutilizáveis globais
│   │   ├── ArmaduraSugerida.tsx
│   │   ├── CargaLinearAlvenaria.tsx
│   │   ├── TabelaK.tsx
│   │   ├── AuthProvider.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── context/                # Contextos globais (ex.: Theme)
│   │   └── ThemeContext.tsx
│   └── utils/                  # Utilitários do sistema
│       ├── pdfGenerator.ts
│       └── persistencia.ts
├── .gitignore
├── appengweb.ps1
├── eslint.config.mjs
├── middleware.ts
├── next.config.js
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json

Novos arquivos devem seguir essa organização. Não altere a estrutura, apenas expanda conforme o padrão acima.

💼 Deploy
O jeito mais simples de publicar seu app Next.js é usar a Plataforma Vercel.

Veja a documentação de deploy do Next.js para mais detalhes.

👤 Assinatura
Desenvolvido por Eng. Joanez Gaspar – CREA 1234567 D

<p align="center">
  <img alt="Engenheiro Joanez Gaspar" src="https://img.shields.io/badge/👷%20Eng.%20Joanez%20Gaspar-1234567%20D%20CREA-38bdf8?style=for-the-badge&color=0369a1&labelColor=27272a">
</p>

versão 1
