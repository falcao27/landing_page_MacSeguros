# MacSeguros

Landing page estática da MacSeguros. A mesma fonte funciona de duas formas:

- aberta diretamente pelo arquivo `src/public/index.html`;
- servida localmente ou publicada como um Worker ESM.

Os caminhos dos assets são relativos e o JavaScript não depende de módulos do navegador. Por isso, CSS, imagens, menu, FAQ, animações e links do WhatsApp continuam funcionando quando a página é aberta por duplo clique.

## Estrutura

```text
src/
├── application/             # Resolução das rotas públicas
├── config/                  # Manifesto das rotas e tipos de conteúdo
├── infrastructure/http/     # Adaptador de Request/Response do Worker
└── public/                  # Site que pode ser aberto diretamente
    ├── index.html
    └── assets/
        ├── css/main.css
        ├── images/
        └── js/
            ├── site-config.js  # Mensagens do WhatsApp
            └── main.js         # Comportamentos da interface
scripts/
├── build.mjs                # Gera o Worker de publicação
├── serve.mjs                # Servidor local
└── validate-artifact.mjs    # Valida arquivos, rotas e respostas HTTP
dist/server/index.js         # Artefato gerado; não editar manualmente
```

## Como visualizar

Para uma conferência rápida, abra `src/public/index.html` no navegador. Para reproduzir o ambiente de publicação, use:

```bash
npm start
```

Depois acesse `http://127.0.0.1:8787`.

No Windows, se o PowerShell bloquear `npm.ps1`, execute `npm.cmd start`.

## Onde alterar

- Textos e estrutura: `src/public/index.html`.
- Cores, espaçamentos e responsividade: `src/public/assets/css/main.css`.
- Telefone do WhatsApp: atributo `data-whatsapp-phone` da tag `<body>` em `src/public/index.html`.
- Mensagens do WhatsApp: `src/public/assets/js/site-config.js`.
- Logos e ordem do carrossel de seguradoras: `src/public/assets/images/partners/` e seção `partners` de `src/public/index.html`.
- Menu, FAQ, animações e demais comportamentos: `src/public/assets/js/main.js`.
- Novos arquivos públicos ou rotas: `src/config/static-routes.js`.
- Regras de resposta HTTP: `src/infrastructure/http/create-site-worker.js`.

Ao trocar o telefone, altere apenas `data-whatsapp-phone`. Use o código do país e o DDD somente com dígitos, sem zero de operadora, espaços ou símbolos. Exemplo: `(85) 98760-8858` deve ser informado como `5585987608858`.

## Build e validação

```bash
npm run build
npm run validate
npm test
```

`npm test` recria `dist/` e verifica as rotas públicas, tipos de conteúdo, imagens, métodos HTTP e a compatibilidade dos caminhos usados na abertura local.

Não edite `dist/server/index.js`: ele é recriado automaticamente a partir dos arquivos em `src/`.
