# Nahid Meet: imagem web própria.
# Parte da imagem oficial jitsi/web (nginx, templates de config, scripts s6) e
# troca só os arquivos compilados do frontend. Prosody, Jicofo e JVB continuam
# nas imagens oficiais do docker-jitsi-meet, na MESMA versão (JITSI_VERSION).
ARG JITSI_VERSION=stable-11248

# ---- build do frontend ----------------------------------------------------
FROM node:24-bookworm AS build
WORKDIR /src

COPY package.json package-lock.json .npmrc ./
COPY patches ./patches
# --ignore-scripts pula os passos do Android no postinstall; os patches web são aplicados à mão.
RUN npm ci --no-audit --no-fund --ignore-scripts && npx patch-package --error-on-fail

COPY . .
RUN node design-system/build.mjs && make

# Mesmo layout do pacote jitsi-meet-web (debian/jitsi-meet-web.install).
RUN mkdir -p /out/web/css /out/defaults && \
    cp -r *.html libs static sounds fonts images lang pwa-worker.js manifest.json \
        resources/robots.txt LICENSE NOTICE MODIFICATIONS.md /out/web/ && \
    cp css/all.css /out/web/css/ && \
    cp interface_config.js /out/defaults/

# ---- imagem final ---------------------------------------------------------
FROM ghcr.io/jitsi/web:${JITSI_VERSION}

LABEL org.opencontainers.image.title="Nahid Meet (web)" \
      org.opencontainers.image.description="Frontend do Nahid Meet, baseado no Jitsi Meet (Apache-2.0)." \
      org.opencontainers.image.source="https://github.com/rodrigonahid/nahid-meet" \
      org.opencontainers.image.licenses="Apache-2.0"

USER root

# Remove o frontend original (menos o link .well-known e o volume de transcrições).
RUN find /usr/share/jitsi-meet -mindepth 1 -maxdepth 1 \
        ! -name .well-known ! -name transcripts -exec rm -rf {} +
COPY --from=build /out/web/ /usr/share/jitsi-meet/
# A imagem oficial move interface_config.js para /defaults; o script de init
# copia de lá para /config. Por isso ele vai para /defaults aqui também.
COPY --from=build /out/defaults/interface_config.js /defaults/interface_config.js

USER s6
