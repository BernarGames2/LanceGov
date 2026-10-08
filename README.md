# LanceGov — site

Landing page da LanceGov, a IA que encontra, lê e prepara as licitações que a pequena empresa pode vencer. Construída a partir da seção 14 do plano da startup.

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · lucide-react · Framer Motion.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # validação de CNPJ e preço anual
npm run typecheck
npm run lint
npm run build && npm start
```

Copie `.env.example` para `.env.local` quando for ligar as integrações abaixo.

## Onde ligar a API

| O quê | Onde | Hoje |
| --- | --- | --- |
| Raio-X do CNPJ | Rota `src/app/api/raio-x/route.ts` | Dados reais: empresa na base pública da Receita (BrasilAPI, com minhareceita.org de reserva) e licitações abertas no PNCP (busca do portal, com a API oficial de consulta de reserva). Os CNAEs viram termos de busca em `src/lib/cnae-terms.ts`. A Nota Lance só aparece depois da leitura do edital, que ainda não existe. |
| Contadores (faixa de confiança e prova social) | `getSiteStats()` em `src/lib/stats.ts` | Sem `LANCEGOV_STATS_URL`, mostra "—". Com ela, lê `{ valorMonitoradoHoje, editaisLidosSemana }` e revalida a cada minuto. |
| Analytics | `send()` em `src/lib/analytics.ts` | Empurra para `window.dataLayer`, e só depois do consentimento de cookies. Troque por PostHog, GA4 etc. |
| Assinatura e vendas | `signupUrl()` e `salesUrl` em `src/lib/site.ts` | Apontam para `/entrar` e `/contato` (páginas "em breve"). |

Eventos registrados: `cta_click`, `cnpj_submit`, `cnpj_invalid`, `raiox_view`, `plan_select`, `whatsapp_click`, `faq_open`. O CNPJ digitado não vai para o analytics.

O Raio-X roda na região `gru1` (São Paulo, `vercel.json`), perto das fontes. Os logs da rota começam com `[raio-x]` no painel da Vercel.

## Antes de publicar

- `src/lib/site.ts`: CNPJ, cidade/UF, WhatsApp (`NEXT_PUBLIC_WHATSAPP_NUMBER`) e e-mail.
- `src/components/social-proof.tsx`: foto, nome e mini-bio do especialista; confirmar as condições da garantia de 14 dias.
- `src/lib/testimonials.ts`: depoimentos reais, com autorização. Com a lista vazia o bloco não aparece.
- `src/components/video-dialog.tsx`: passar `src` do vídeo de 2 minutos.
- `/termos` e `/privacidade`: texto provisório, para revisão jurídica.
- Páginas "em breve" (`src/app/(em-breve)/*`): ao criar a página real, troque o arquivo e apague a entrada em `src/lib/coming-soon.ts`.
- Publicar em `lancegov.com.br` (`NEXT_PUBLIC_SITE_URL`) com o `.com` redirecionando.

## Estrutura

- `src/components/`: `Navbar`, `Hero`, `CnpjForm`, `TrustBar`, `Problem`, `Benefits`, `HowItWorks`, `Demo`, `SocialProof`, `Pricing`, `Faq`, `FinalCta`, `Footer`, `RaioXResult`, mais `NotaLance` (medidor), `Highlight` (grifo marca-texto), `OpportunityCard` e `CookieConsent`.
- `src/components/ui/`: componentes shadcn/ui (button, input, badge, accordion, tabs, dialog, switch).
- `src/app/globals.css`: tokens da marca no tema do Tailwind (`tinta`, `papel`, `marca-texto`, `grafite`, `vitoria`, `prazo`, `risco`, `linha`) e os tokens semânticos do shadcn apontando para eles.
- `src/lib/cnpj.ts`: máscara e validação do CNPJ numérico e alfanumérico (módulo 11, valor = ASCII − 48).

## Marca

Papel claro, tinta escura e um marca-texto lima que só aparece em ação ou destaque, sempre com texto em tinta. Verde, âmbar e vermelho significam vai, prazo e risco; em texto pequeno use `vitoria-escuro` e `risco-escuro`. Nada de verde-amarelo, brasão ou visual de portal oficial.
