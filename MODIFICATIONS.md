# Arquivos modificados em relação ao Jitsi Meet

Base: tag `stable/jitsi-meet_11248` de https://github.com/jitsi/jitsi-meet.
Exigência da Apache License 2.0, seção 4(b). Nenhuma lógica da aplicação foi alterada:
só tema, marca e textos.

## Alterados

| Arquivo | O que mudou |
| --- | --- |
| `react/features/base/ui/utils.ts` | Aplica a camada `brandTokens` depois dos tokens do Jitsi. |
| `react/features/base/ui/Tokens.ts` | `font` e `shape` (raios) vêm do design system. |
| `css/_variables.scss` | Importa os tokens SCSS; fonte, raios, fundo da tela inicial, cores de botões e marca d'água. |
| `css/_welcome_page.scss` | Página inicial no tema escuro (fundo, campo de sala, abas, cards). |
| `css/_chat.scss`, `css/_meetings_list.scss` (lista de reuniões recentes no tema escuro), `css/_popup_menu.scss`, `css/premeeting/_premeeting-screens.scss`, `css/reload_overlay/_reload_overlay.scss` | Azuis fixos trocados por tokens da marca. |
| `interface_config.js` | `APP_NAME`, `PROVIDER_NAME`, links, fundo padrão, sem promoção nem rodapé de app móvel. |
| `title.html`, `static/secondScreen.html` | Título, descrição e imagem de compartilhamento. |
| `fonts.html` | Carrega a fonte Inter. |
| `manifest.json` | Nome e cores do PWA; remove o vínculo com o app Android do Jitsi. |
| `lang/main.json`, `lang/main-pt-BR.json` | Textos que citavam "Jitsi" como nome do produto. |
| `images/favicon.svg`, `images/watermark.svg`, `images/apple-touch-icon.png`, `static/pwa/icons/*.png` | Logo e ícones da marca. |
| `README.md` | Documentação do fork (o README original está em `README.upstream.md`). |

## Removidos

- `images/jitsilogo.png` (logo do Jitsi, substituído por `images/nahid-meet-og.png`).

## Adicionados

- `design-system/` — tokens da marca (fonte única) e gerador de CSS/SCSS/JSON.
- `react/features/base/ui/brandTokens.ts` — mapeia o design system para os tokens do Jitsi.
- `images/nahid-meet-og.png` — imagem de compartilhamento.
- `Dockerfile`, `.dockerignore`, `deploy/`, `.github/workflows/nahid-image.yml` — imagem e deploy.
- `NOTICE`, `MODIFICATIONS.md`.
