# Fiscal SC — MVP

Aplicação experimental em Next.js para facilitar o primeiro contato com dados públicos estaduais de Santa Catarina.

## Funcionalidades

- painel cívico responsivo inspirado no mockup Fiscal SC;
- consulta e filtros de gastos públicos;
- acompanhamento de projetos legislativos;
- nove missões educativas com categorias e progresso;
- condições gamificada e neutra funcionalmente equivalentes;
- perfil pseudonimizado e exportação de eventos da pesquisa;
- links para fontes oficiais.

Os registros desta versão são demonstrativos e servem para validar os fluxos.

## Executar

```powershell
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Verificações

```powershell
npm run typecheck
npm run build
```

## Estilos

O projeto usa Tailwind CSS 4, PostCSS e Lucide React. Os tokens globais estão no bloco `@theme` de `app/globals.css`; o novo shell visual está em `components/layout/app-shell.tsx`.

## Rotas

- `/` — painel inicial;
- `/missoes` e `/missoes/[id]` — catálogo e detalhes;
- `/gastos` e `/gastos/[id]` — dados do Executivo;
- `/projetos` e `/projetos/[id]` — dados do Legislativo;
- `/progresso` — progresso pessoal;
- `/pesquisa` — perfil e controles do estudo.

## Persistência

Condição, progresso, perfil e eventos ficam no `localStorage`. Para a avaliação principal, essa camada deverá ser substituída por PostgreSQL e sessões seguras no servidor.
