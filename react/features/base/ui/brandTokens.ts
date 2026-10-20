/*
 * Nahid Meet: arquivo adicionado no fork (não existe no upstream do Jitsi Meet).
 *
 * Traduz os tokens do design system (design-system/tokens.json) para os nomes de
 * token que o tema do Jitsi Meet usa (tokens.json / jitsiTokens.json). Esta camada
 * é aplicada por último em utils.ts, então só sobrescreve o que estiver aqui.
 * Para mudar o visual, edite design-system/tokens.json e rode
 * `node design-system/build.mjs`; este arquivo só faz o mapeamento.
 */
import ds from '../../../../design-system/dist/tokens.json';

import * as baseTokens from './tokens.json';

const c = ds.color;
const s = ds.semantic;

const colors = {
    // Ações primárias (azul do Jitsi -> verde da marca).
    action01: s.accent,
    action04: s.accent,
    action05: s.accent,
    action06: s.accentActive,
    action07: s.accentSubtle,
    action08: c.green[200],
    action09: s.accent,
    hover01: s.accentHover,
    hover07: c.green[200],
    hover11: c.green[200],
    active01: s.accentActive,
    active07: s.accentActive,
    active11: s.accentSubtle,

    // Ações destrutivas.
    action03: s.danger,
    hover03: s.dangerHover,
    active03: s.dangerActive,
    error01: s.dangerHover,
    alertRed: s.dangerHover,

    // Sucesso / aviso.
    success01: s.success,
    alertGreen: s.success,
    hover04: c.green[300],
    active04: s.accentActive,
    warning01: s.warning,
    warning02: s.warning,
    alertYellow: s.warning,
    highlight01: s.warning,

    // Foco e ícones de destaque.
    focus01: s.focus,
    icon04: s.accent,
    ui09: s.accentSubtle,
    ui13: c.green[900],
    ui15: c.green[900],
    ui22: s.accentSubtle,

    // Superfícies (sobrescrevem jitsiTokens.json).
    surface01: s.bg,
    surface02: s.surface,
    surface03: s.surfaceRaised,
    surface05: c.neutral[500],
    surface08: c.neutral[700],
    ui02: s.borderStrong,
    ui05: s.surfaceRaised,
    ui06: s.bgAlt,
    ui11: s.bgAlt,
    ui12: s.surfaceRaised,
    ui25: s.bgAlt,
    hover05: s.surfaceHover,
    hover08: s.surfaceRaised,
    hover10: s.surfaceRaised,
    active09: s.surfaceHover,
    active10: s.surfaceHover,

    // Texto.
    textColor01: s.text,
    textColor02: s.textMuted,
    textColor05: s.textMuted,
    textColor06: s.text,
    textColor08: s.text
};

// Tokens tipográficos do Jitsi trazem fontFamily embutida; troca só a família.
const typography = Object.fromEntries(
    Object.entries(baseTokens)
        .filter(([ , value ]) => value && typeof value === 'object' && 'fontFamily' in value)
        .map(([ key, value ]) => [ key, { ...(value as object), fontFamily: ds.font.family.sans } ])
);

export const brandTokens = { ...typography, ...colors };

export const brandFont = {
    weightRegular: ds.font.weight.regular,
    weightSemiBold: ds.font.weight.semibold
};

export const brandShape = {
    borderRadius: ds.radius.md,
    circleRadius: 50,
    boxShadow: 'inset 0px -1px 0px rgba(255, 255, 255, 0.08)'
};
