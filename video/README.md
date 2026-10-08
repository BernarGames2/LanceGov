# Vídeo "Como a LanceGov funciona"

Vídeo de 2 minutos (1920×1080, 30 fps, sem som) que abre no botão "Ver como funciona" do site. É feito em código com [Remotion](https://www.remotion.dev): cada cena é um componente React.

## Editar

```bash
cd video
npm install
npm run studio        # abre o editor visual no navegador
```

- Textos e animações de cada cena: `src/scenes/NN-*.tsx`.
- Duração de cada cena e transições: `src/scenes/timing.ts`.
- Cores, fontes e peças comuns (cartões, Nota Lance, celular do WhatsApp): `src/design/`.
- Ver só uma cena, sem renderizar o vídeo todo: `node scripts/preview.mjs 05-edital` (gera quadros em `out/preview/`).

Todo número de produto aparece dentro de uma tela marcada "Exemplo". Mantenha assim.

## Renderizar para o site

```bash
npm run render   # gera ../public/video/como-funciona.mp4
npm run poster   # gera ../public/video/como-funciona-poster.jpg
```

Depois, faça o commit dos dois arquivos em `public/video/`. Se mudar alguma fala, atualize também o roteiro escrito em `src/components/video-dialog.tsx` (lá fora desta pasta).

## Licença do Remotion

O Remotion é gratuito para pessoas e para empresas com até 3 funcionários. Acima disso é preciso comprar a licença de empresa: https://www.remotion.dev/license
