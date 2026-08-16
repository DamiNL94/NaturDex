#!/usr/bin/env node
/*
 * sync-habitat-catalog.js — un hábitat, una descripción, en todos los parques de España.
 *
 * El problema que resuelve
 * -----------------------
 * La descripción del hábitat era un campo curado dentro de cada `park.json` (`adopt-habitats.js` la
 * conserva parque a parque), y se redactó mirando el espacio piloto. El resultado: el 5330 decía
 * «terrestre del parque piloto», el 1210 «en las playas del parque» y el 1510 nombraba una marina
 * concreta. Eso es falso en cuanto el mismo código HIC aparece en otro sitio — y aparece: el 5330
 * está en media España. Además, doce de los treinta y cinco hábitats cartografiados no tenían
 * ninguna descripción.
 *
 * La separación es la misma que ya rige en las especies (`sync-species-catalog.js`):
 *
 *   - Lo que el hábitat ES: qué vegetación es, cómo se reconoce, de qué depende. Un 5330 es el
 *     mismo tipo de matorral en Almería y en Tarragona → UNIVERSAL, y por tanto va indexado por
 *     CÓDIGO HIC en `catalogo-nacional/data/contenido/habitats.json`.
 *   - Lo que hay EN ESTE ESPACIO: el polígono, la superficie, el centroide, las especies citadas,
 *     la asociación que la cartografía asigna a sus recintos → LOCAL, sigue en el `park.json`.
 *
 * Y además: la asociación fitosociológica
 * ---------------------------------------
 * La ficha mostraba «Rhamno lycioidis-Quercetum cocciferae Br.-Bl. & O. Bolòs 1954» y nada más. Es
 * dato oficial y no se toca, pero para quien no es botánico no dice absolutamente nada. Este script
 * exporta a `Frontend/Data/fitosociologia.json` un diccionario que la app usa para acompañar cada
 * cita de su lectura en llano («Coscojar con espino negro»), de las plantas que le dan nombre y de
 * cómo se lee la nomenclatura. La cita completa, con autores y año, se sigue mostrando entera: es
 * la referencia bibliográfica y es lo que permite rastrear el dato hasta su publicación.
 *
 * Uso
 * ---
 *   node Tools/sync-habitat-catalog.js                Informa: hábitats sin descripción universal,
 *                                                     textos que nombran un parque, divergencias
 *                                                     entre parques y asociaciones sin lectura llana.
 *                                                     No escribe nada. Sale con 1 si hay algo que ver.
 *   node Tools/sync-habitat-catalog.js --apply        Escribe la descripción universal en todos los
 *                                                     park.json y exporta Data/fitosociologia.json.
 *   node Tools/sync-habitat-catalog.js --apply --sql Database/habitats-universal.sql
 *                                                     Además genera los UPDATE para la BD (hace
 *                                                     falta: Frontend/Js/data.js da PRIORIDAD a la
 *                                                     API sobre el park.json cuando hay backend).
 */
'use strict';

const path = require('path');
const { arg, flag } = require('./lib/cli');
const { sqlStr } = require('./lib/sql');
const { CATALOGO_DIR, DATA, readJson, readJsonIf, writeJson, rel, fromRoot, parkFiles } = require('./lib/io');

const CONTENIDO_DIR = path.join(CATALOGO_DIR, 'data', 'contenido');
const HABITATS = path.join(CONTENIDO_DIR, 'habitats.json');
const FITO = path.join(CONTENIDO_DIR, 'fitosociologia.json');
const FITO_EXPORT = path.join(DATA, 'fitosociologia.json');

// Campos del hábitat que describen al TIPO de hábitat y se sincronizan a todos los parques. Hoy
// solo la descripción: el nombre y el tipo ya vienen de data/hic-nombres.json por otra vía
// (adopt-habitats.js), y el resto —polígono, centroide, color, foto, especies— o es local o es
// presentación.
const UNIVERSALES = ['description'];

// Texto que delata que un campo universal se escribió pensando en un espacio concreto. Es el mismo
// criterio que en sync-species-catalog.js, más los giros que aparecieron en las descripciones de
// hábitat («terrestre del parque piloto», «marina de Cope»).
const RASTRO_LOCAL = /\b(este parque|del parque|en el parque|parque piloto|este espacio|en la marina|Cabo Cope|Calnegre|Marina de Cope|Espuña|Cuatro Calas|ZEPA ES\d+|LIC\/ZEC ES\d+)\b/i;

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const vacio = v => v === null || v === undefined || String(v).trim() === '';

// La cadena oficial es «<nombre latino> <autoría>» y a veces lleva una nota entre paréntesis al
// final. El diccionario está indexado por el nombre latino, así que se busca la clave más larga que
// sea prefijo de la cadena: así una misma asociación con autoría corregida o anotada sigue
// encontrando su entrada, y una clave corta («Ziziphetum loti») nunca le roba la cita a una larga.
function buscarAsociacion(cadena, claves) {
  let mejor = null;
  for (const clave of claves) {
    if (!cadena.startsWith(clave)) continue;
    if (!mejor || clave.length > mejor.length) mejor = clave;
  }
  return mejor;
}

function cargarCatalogo() {
  const doc = readJsonIf(HABITATS);
  if (!doc) {
    console.error(`No existe ${rel(HABITATS)}. Es la fuente de las descripciones universales.`);
    process.exit(1);
  }
  return doc.codigos || {};
}

function cargarFito() {
  const doc = readJsonIf(FITO);
  if (!doc) return { explicacion: null, asociaciones: {} };
  return { explicacion: doc.explicacion || null, asociaciones: doc.asociaciones || {} };
}

// --- informe (sin --apply) -------------------------------------------------------------------------
function comprobar() {
  const catalogo = cargarCatalogo();
  const fito = cargarFito();
  const claves = Object.keys(fito.asociaciones);

  const porCodigo = new Map();   // code -> [{ slug, h }]
  const asociaciones = new Map(); // cadena oficial -> Set(slug)

  for (const { slug, file } of parkFiles()) {
    for (const h of (readJson(file).habitats || [])) {
      const code = String(h.code || '');
      if (!porCodigo.has(code)) porCodigo.set(code, []);
      porCodigo.get(code).push({ slug, h });
      for (const a of (h.fitosociologia || [])) {
        if (!asociaciones.has(a)) asociaciones.set(a, new Set());
        asociaciones.get(a).add(slug);
      }
    }
  }

  const sinCatalogo = [], contaminados = [], divergentes = [], sinDescripcion = [];
  for (const [code, apariciones] of porCodigo) {
    if (!catalogo[code]) sinCatalogo.push(`${code} (${apariciones.map(a => a.slug).join(', ')})`);
    for (const { slug, h } of apariciones) {
      if (vacio(h.description)) { sinDescripcion.push(`${slug}: ${code}`); continue; }
      const m = String(h.description).match(RASTRO_LOCAL);
      if (m) contaminados.push(`${slug}: ${code} — «${m[0]}»`);
    }
    for (const campo of UNIVERSALES) {
      const valores = new Set(apariciones.map(a => JSON.stringify(a.h[campo] ?? null)));
      if (valores.size > 1) divergentes.push(`${code} — ${campo} (${apariciones.map(a => a.slug).join(' vs ')})`);
    }
  }

  const sinLectura = [...asociaciones].filter(([a]) => !buscarAsociacion(a, claves));
  const sobrantes = claves.filter(c => ![...asociaciones.keys()].some(a => a.startsWith(c)));

  console.log(`Códigos HIC cartografiados: ${porCodigo.size} · con descripción universal en el catálogo: ${[...porCodigo.keys()].filter(c => catalogo[c]).length}`);
  console.log(`Asociaciones distintas en los park.json: ${asociaciones.size} · con lectura en llano: ${asociaciones.size - sinLectura.length}`);

  const bloque = (titulo, lista) => {
    console.log(`\n${titulo}: ${lista.length}`);
    lista.slice(0, 30).forEach(x => console.log('  · ' + x));
    if (lista.length > 30) console.log(`  … y ${lista.length - 30} más`);
  };
  bloque('Códigos sin descripción universal escrita', sinCatalogo);
  bloque('Hábitats con la descripción vacía en el park.json', sinDescripcion);
  bloque('Descripciones que nombran un espacio concreto', contaminados);
  bloque('Mismo código HIC con textos distintos entre parques', divergentes);
  bloque('Asociaciones sin lectura en llano', sinLectura.map(([a, p]) => `${a} (${[...p].join(', ')})`));
  if (sobrantes.length) bloque('Entradas del diccionario que ya no usa ninguna cartografía', sobrantes);

  return sinCatalogo.length + sinDescripcion.length + contaminados.length + divergentes.length + sinLectura.length;
}

// --- --apply ---------------------------------------------------------------------------------------
function aplicar() {
  const catalogo = cargarCatalogo();
  const sqlPath = arg('--sql', null);
  const sql = [];
  let fichas = 0, cambiadas = 0;
  const huerfanos = [];

  for (const { slug, file } of parkFiles()) {
    const park = readJson(file);
    if (!(park.habitats || []).length) continue;
    let tocado = false;

    for (const h of park.habitats) {
      fichas++;
      const universal = catalogo[String(h.code || '')];
      if (!universal) { huerfanos.push(`${slug}: ${h.code} ${h.name}`); continue; }
      let cambia = false;
      for (const campo of UNIVERSALES) {
        if (universal[campo] === undefined) continue;
        if (igual(h[campo], universal[campo])) continue;
        h[campo] = universal[campo];
        cambia = true;
      }
      if (cambia) { cambiadas++; tocado = true; }
    }

    if (tocado) { writeJson(file, park); console.log(`  → ${rel(file)}`); }

    if (sqlPath) {
      for (const h of park.habitats) {
        const u = catalogo[String(h.code || '')];
        if (!u || u.description === undefined) continue;
        sql.push(
          'UPDATE habitats h JOIN parks p ON p.id = h.park_id\n' +
          `  SET h.description = ${sqlStr(u.description)}\n` +
          `WHERE p.slug = ${sqlStr(slug)} AND h.code = ${sqlStr(String(h.code))};`
        );
      }
    }
  }

  console.log(`\nHábitats revisados ${fichas} · actualizados ${cambiadas}`);
  if (huerfanos.length) {
    console.log(`\n⚠ ${huerfanos.length} hábitat(s) sin descripción universal escrita (se dejan como estaban).`);
    console.log(`  Añade su código en ${rel(HABITATS)}:`);
    huerfanos.slice(0, 20).forEach(x => console.log('  · ' + x));
  }

  // Diccionario para la app. Se exporta desde `data/contenido/` en vez de editarse a mano en
  // Frontend/Data/ por la misma razón que el resto del contenido universal: una sola fuente de
  // verdad, versionada junto a las descripciones que explica.
  const fito = cargarFito();
  writeJson(FITO_EXPORT, {
    _generado: 'Tools/sync-habitat-catalog.js --apply desde Tools/catalogo-nacional/data/contenido/fitosociologia.json. No editar a mano.',
    explicacion: fito.explicacion,
    asociaciones: fito.asociaciones,
  });
  console.log(`Diccionario de asociaciones: ${Object.keys(fito.asociaciones).length} entradas → ${rel(FITO_EXPORT)}`);

  if (sqlPath && sql.length) {
    const cabecera = [
    '-- El juego de caracteres se fija SIEMPRE: el cliente `mysql` lo toma del entorno y en un',
    '-- contenedor sin locale eso es latin1, que convierte cada tilde en mojibake sin dar error.',
    'SET NAMES utf8mb4;',
    '',
      '-- habitats-universal.sql — descripción universal de las fichas de hábitat.',
      '-- GENERADO por Tools/sync-habitat-catalog.js --apply --sql. No editar a mano:',
      '-- la fuente es Tools/catalogo-nacional/data/contenido/habitats.json, indexada por código HIC.',
      '--',
      '-- Hace falta porque Frontend/Js/data.js prioriza la respuesta de la API sobre el park.json',
      '-- empaquetado: sin aplicar esto, un despliegue con backend seguiría sirviendo los textos viejos.',
      '', '',
    ].join('\n');
    const destino = fromRoot(sqlPath);
    require('fs').writeFileSync(destino, cabecera + sql.join('\n\n') + '\n', 'utf8');
    console.log(`SQL escrito en ${rel(destino)} (${sql.length} UPDATE)`);
  }
}

if (flag('--apply')) aplicar();
else process.exit(comprobar() ? 1 : 0);
