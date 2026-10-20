// Nahid Meet: anexado ao config.js gerado pela imagem web.
// Vai em ${CONFIG}/web/custom-config.js.

// Recebe vídeo de no máximo 4 participantes por vez (os que falaram por último).
config.channelLastN = 4;

// Sem chamadas externas que não usamos.
config.disableThirdPartyRequests = true;
config.analytics = Object.assign(config.analytics || {}, { disabled: true });
config.giphy = Object.assign(config.giphy || {}, { enabled: false });
