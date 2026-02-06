# Church App Frontend

PWA mobile-first whitelabel para igrejas.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Estilo:** Tailwind CSS v4
- **Internacionalização:** next-intl (PT, EN)
- **PWA:** @ducanh2912/next-pwa
- **Imagens:** Sharp

## Funcionalidades

| Rota | Funcionalidade |
|------|----------------|
| `/` | Home (banner, live, versículo do dia, próximo evento, último sermão, avisos) |
| `/biblia` | Leitor bíblico com versões, busca, bookmarks |
| `/agenda` | Lista de eventos com paginação |
| `/agenda/:id` | Detalhe do evento (RSVP) |
| `/sermoes` | Lista de sermões com busca |
| `/sermoes/:id` | Detalhe do sermão (YouTube, materiais) |
| `/oracoes` | Pedidos de oração (criar, "eu orei") |
| `/mais` | Sobre, horários, localização, grupos, doações, redes sociais |

## Setup local

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Instalar dependências
pnpm install

# 3. Rodar o servidor de desenvolvimento
pnpm dev
```

O servidor inicia em `http://localhost:8000`.

## Variáveis de ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base da API backend | Sim |
| `NEXT_PUBLIC_CHURCH_SLUG` | Slug identificador da igreja | Sim |

> **Nota:** Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser por design do Next.js. Estas variáveis contêm apenas dados públicos (URL da API e identificador da igreja). **Nunca** adicione chaves secretas, tokens ou credenciais com este prefixo.

## Deploy

### Vercel (recomendado)

1. Conecte o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_CHURCH_SLUG`
3. Deploy automático a cada push na branch `main`

### Docker

```bash
docker build -t church-frontend .
docker run -p 8000:8000 \
  -e NEXT_PUBLIC_API_URL=https://api.exemplo.com \
  -e NEXT_PUBLIC_CHURCH_SLUG=minha-igreja \
  church-frontend
```

## PWA - Gerar ícones

Para regenerar os ícones do PWA a partir do `public/favicon.svg`:

```bash
node scripts/generate-icons.mjs
```

Gera automaticamente todos os tamanhos necessários (72, 96, 128, 144, 152, 192, 384, 512px) + apple-touch-icon + favicon.ico.

## Estrutura do projeto

```
src/
├── app/
│   ├── [locale]/          # Páginas com suporte i18n
│   ├── globals.css        # Estilos globais e tema
│   └── layout.tsx         # Root layout
├── components/            # Componentes reutilizáveis
├── i18n/                  # Configuração next-intl
├── lib/
│   ├── api.ts             # Cliente API centralizado
│   └── church.ts          # Helper do slug da igreja
└── messages/              # Ficheiros de tradução (pt.json, en.json)
```

## Segurança

- Variáveis de ambiente sensíveis **nunca** devem usar o prefixo `NEXT_PUBLIC_`
- O ficheiro `.env.local` está no `.gitignore` e nunca deve ser commitado
- A API URL e o church slug são dados públicos por natureza (visíveis no browser)
- O honeypot no formulário de oração protege contra spam
