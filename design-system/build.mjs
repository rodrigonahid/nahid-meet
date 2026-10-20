#!/usr/bin/env node
// Gera os artefatos do design system a partir de tokens.json (fonte única):
//   dist/tokens.json  -> tokens com referências resolvidas (para JS/TS)
//   dist/tokens.css   -> variáveis CSS (--nd-*) em :root
//   dist/_tokens.scss -> variáveis SCSS ($nd-*)
// Uso: node design-system/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));

delete source.$description;

const lookup = path => path.split('.').reduce((node, key) => node?.[key], source);

function resolve(value, depth = 0) {
    if (typeof value !== 'string') {
        return value;
    }

    return value.replace(/\{([^}]+)\}/g, (_, path) => {
        const target = lookup(path);

        if (target === undefined || depth > 10) {
            throw new Error(`Referência inválida: {${path}}`);
        }

        return resolve(target, depth + 1);
    });
}

function walk(node, fn, prefix = []) {
    return Object.fromEntries(Object.entries(node).map(([ key, value ]) => [
        key,
        value && typeof value === 'object' ? walk(value, fn, [ ...prefix, key ]) : fn(value, [ ...prefix, key ])
    ]));
}

const resolved = walk(source, value => resolve(value));

// Achata em pares nome/valor: color.green.500 -> color-green-500; semantic.* perde o prefixo.
const flat = [];

walk(resolved, (value, path) => {
    if (path[0] === 'font' && path[1] === 'googleFontsUrl') {
        return value;
    }
    const parts = path[0] === 'semantic' ? path.slice(1) : path;
    const name = parts.map(p => p.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)).join('-');
    const unit = path[0] === 'radius' ? 'px' : '';

    flat.push([ name, `${value}${unit}` ]);

    return value;
});

const banner = '/* Gerado por design-system/build.mjs a partir de tokens.json. Não edite. */\n';

mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist/tokens.json'), `${JSON.stringify(resolved, null, 4)}\n`);
writeFileSync(join(here, 'dist/tokens.css'),
    `${banner}:root {\n${flat.map(([ n, v ]) => `    --nd-${n}: ${v};`).join('\n')}\n}\n`);
writeFileSync(join(here, 'dist/_tokens.scss'),
    `${banner}${flat.map(([ n, v ]) => `$nd-${n}: ${v};`).join('\n')}\n`);

console.log(`design-system: ${flat.length} tokens gerados em dist/`);
