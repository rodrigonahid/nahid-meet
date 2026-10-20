# Nahid Meet

Videochamadas privadas no navegador, com a minha identidade visual. **Baseado no
[Jitsi Meet](https://github.com/jitsi/jitsi-meet)** (Apache 2.0), sem afiliação com o
projeto Jitsi.

É um *fork fino*: só o frontend web, com mudanças concentradas em tema, marca e textos.
Nenhuma lógica foi alterada. O back-end (Prosody, Jicofo, JVB) roda com as imagens
oficiais do [docker-jitsi-meet](https://github.com/jitsi/docker-jitsi-meet).

- Arquivos alterados: [MODIFICATIONS.md](MODIFICATIONS.md)
- Licença e créditos: [LICENSE](LICENSE), [NOTICE](NOTICE)
- README original do Jitsi Meet: [README.upstream.md](README.upstream.md)

## Como a marca entra no código

```
design-system/tokens.json          ← fonte única: cores, fontes, raios
        │  node design-system/build.mjs
        ▼
design-system/dist/
  tokens.json   → react/features/base/ui/brandTokens.ts → tema MUI/JSS do Jitsi
  _tokens.scss  → css/_variables.scss                  → SCSS legado
  tokens.css    → (para outros projetos: variáveis --nd-*)
```

- `brandTokens.ts` só **mapeia** os tokens do design system para os nomes que o Jitsi usa
  (`action01`, `surface02`, `textColor01`…). É aplicado por último em `utils.ts`, então o
  tema do upstream continua valendo para o que não foi mapeado.
- Para mudar o visual, edite `design-system/tokens.json` e rode `node design-system/build.mjs`.
  Os arquivos de `dist/` ficam versionados para que outros projetos possam importá-los direto.

### Reaproveitar o design system em outro projeto

O diretório `design-system/` é um pacote independente (`@rodrigonahid/design-tokens`), sem
dependências:

```css
@import "@rodrigonahid/design-tokens/tokens.css"; /* var(--nd-accent), var(--nd-radius-md)… */
```

```ts
import tokens from '@rodrigonahid/design-tokens/tokens.json';
```

Enquanto ele não tiver repositório próprio, dá para instalar direto do GitHub ou copiar
`design-system/dist/`.

## Desenvolvimento

O upstream exige Node ≥ 24 e npm ≥ 11.

```bash
npm ci
node design-system/build.mjs
make            # compila (webpack) e copia tudo para libs/ e css/all.css
make dev        # servidor de desenvolvimento com hot reload
```

`make dev` faz proxy para um back-end Jitsi; por padrão aponta para `https://alpha.jitsi.net`.
Para usar o seu: `WEBPACK_DEV_SERVER_PROXY_TARGET=https://meet.rodrigonahid.com.br make dev`.

Se a máquina tiver outra versão do Node, use um container:

```bash
docker run --rm -it -u $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/app -w /app node:24 make
```

## Imagem Docker

O [Dockerfile](Dockerfile) compila o frontend num estágio `node:24` e copia o resultado por
cima da imagem oficial `ghcr.io/jitsi/web`, na mesma versão do resto do stack. Nginx,
templates de `config.js` e scripts de inicialização continuam sendo os oficiais.

```bash
docker build -t ghcr.io/rodrigonahid/nahid-meet-web:stable-11248 .
```

O workflow [nahid-image.yml](.github/workflows/nahid-image.yml) faz o mesmo a cada push na
`main` e publica em `ghcr.io/rodrigonahid/nahid-meet-web` (tags `stable-11248`, `latest` e
`sha-…`).

Em forks o GitHub Actions começa desligado. Ao ligar, desligue os workflows do upstream,
que não fazem sentido aqui:

```bash
for w in ci.yml ci-lua.yml prosody-plugin-tests.yml release-rnsdk.yml stale.yml; do gh workflow disable "$w" -R rodrigonahid/nahid-meet; done
```

## Sincronizar com o upstream

A `main` parte de uma tag estável do Jitsi Meet. Atualizar é um merge da tag nova:

```bash
git remote add upstream https://github.com/jitsi/jitsi-meet.git   # só na primeira vez
git fetch upstream --tags
git tag -l 'stable/jitsi-meet_*' | sort -V | tail -3                # escolha a nova tag
git merge stable/jitsi-meet_NNNNN
```

1. Conflitos costumam aparecer só nos arquivos de [MODIFICATIONS.md](MODIFICATIONS.md). Em
   `README.md`, fique com a nossa versão. Nos demais, mantenha a mudança do upstream e
   reaplique a linha da marca.
2. Se o upstream adicionar tokens de cor novos em `react/features/base/ui/tokens.json`,
   avalie se precisam entrar em `brandTokens.ts`.
3. Procure novos azuis fixos no SCSS: `grep -rniE '#(4687ED|246FE5|0056E0|0074E0|0376DA)' css`.
4. Atualize a versão em **três** lugares, sempre igual à tag do
   [docker-jitsi-meet](https://github.com/jitsi/docker-jitsi-meet/releases)
   (`stable-NNNNN`): `ARG JITSI_VERSION` no `Dockerfile`, `JITSI_VERSION` no workflow e
   `JITSI_IMAGE_VERSION`/`NAHID_MEET_IMAGE` em `deploy/env.example`.
5. `make`, confira no navegador e faça push.

## Deploy na VPS (2 vCPU / 4 GB)

Arquivos em [deploy/](deploy): `env.example`, `docker-compose.override.yml`,
`custom-config.js` e `Caddyfile.snippet`.

```bash
cd /srv/apps
git clone --depth 1 --branch stable-11248 https://github.com/jitsi/docker-jitsi-meet.git jitsi
cd jitsi
cp /caminho/nahid-meet/deploy/env.example .env
cp /caminho/nahid-meet/deploy/docker-compose.override.yml .
./gen-passwords.sh
mkdir -p config/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,storage/web,storage/prosody,storage/transcripts}
chown -R 1000:1000 config/storage   # os containers rodam como uid 1000
cp /caminho/nahid-meet/deploy/custom-config.js config/web/
docker compose up -d     # sobe web, prosody, jicofo e jvb; sem Jibri, Jigasi, Etherpad
```

Depois:

- DNS: registro `A` de `meet.rodrigonahid.com.br` → `143.95.170.215`.
- Firewall: liberar **UDP 10000** (mídia do JVB).
- Caddy: colar `deploy/Caddyfile.snippet` em `/srv/caddy/Caddyfile` e recarregar.

O que deixa o stack leve (nomes conferidos na tag `stable-11248`):

| Opção | Valor | Onde |
| --- | --- | --- |
| `VIDEOBRIDGE_MAX_MEMORY` / `JICOFO_MAX_MEMORY` | `768m` / `384m` | `.env` |
| `mem_limit` dos containers | web 256m, prosody 256m, jicofo 640m, jvb 1200m | override |
| `ENABLE_P2P` | `1` (2 pessoas = sem passar pelo JVB) | `.env` |
| `RESOLUTION` / `RESOLUTION_WIDTH` | `720` / `1280` | `.env` |
| `config.channelLastN` | `4` | `custom-config.js` |
| `ENABLE_RECORDING`, `ENABLE_TRANSCRIPTIONS` | `0` | `.env` |
| Jibri, Jigasi, Etherpad, whiteboard | não sobem (arquivos `.yml` extras não são usados) | — |

### Login por app externo (próxima etapa)

O `.env` já traz, comentado, o bloco de JWT (`ENABLE_AUTH=1`, `AUTH_TYPE=jwt`,
`JWT_APP_ID`, `JWT_APP_SECRET`, `JWT_ACCEPTED_ISSUERS`, `JWT_ACCEPTED_AUDIENCES`,
`ENABLE_GUESTS`, `TOKEN_AUTH_URL`). O portal (Next.js + Better Auth com Google) assina o
token com o mesmo segredo e redireciona para `https://meet.rodrigonahid.com.br/<sala>?jwt=…`.
