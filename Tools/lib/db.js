'use strict';
/*
 * db.js — acceso a la base de datos VIVA a través del contenedor de Docker.
 *
 * El repositorio no declara ningún cliente MySQL como dependencia (todo el tooling es zero-dep salvo
 * `polygon-clipping`), así que las herramientas que necesitan leer la BD real lo hacen ejecutando
 * `mysql` DENTRO del contenedor con `docker exec`. Estaba implementado dos veces —`Tools/db-sync/
 * db-sync.js` y `Tools/eidos-diff.js`— con la misma detección de contenedor y el mismo `MYSQL_PWD`.
 *
 * La contraseña NUNCA viaja en la línea de órdenes: se toma de la variable `MYSQL_ROOT_PASSWORD` que
 * ya vive dentro del contenedor y se pasa a `mysql` por `MYSQL_PWD`, que es la vía que no aparece en
 * `ps` ni en el historial del shell.
 */
const { execFileSync, spawnSync } = require('child_process');
const { ROOT } = require('./io');

const DB_NAME = 'naturadex';
const CONTENEDOR_POR_DEFECTO = 'naturdex-db-1';

/**
 * Nombre o id del contenedor de la BD. Orden de resolución: variable de entorno explícita →
 * `docker compose ps -q db` → nombre por defecto del proyecto compose.
 */
function findContainer() {
  if (process.env.NATURDEX_DB_CONTAINER) return process.env.NATURDEX_DB_CONTAINER;
  try {
    const id = execFileSync('docker', ['compose', 'ps', '-q', 'db'], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (id) return id;
  } catch (_) { /* docker compose no disponible o servicio no arriba */ }
  return CONTENEDOR_POR_DEFECTO;
}

/** ¿Está en marcha? Devuelve true/false sin abortar, para los modos tolerantes (hook de pre-commit). */
function isContainerRunning(name = findContainer()) {
  try {
    const state = execFileSync('docker', ['inspect', '-f', '{{.State.Running}}', name],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return state === 'true';
  } catch (_) {
    return false;
  }
}

let cache = null;
/** Contenedor verificado y en marcha, o aborta con instrucciones concretas. */
function container(onFail) {
  if (cache) return cache;
  const name = findContainer();
  if (!isContainerRunning(name)) {
    const msg = `No encuentro en marcha el contenedor de la BD ('${name}').\n` +
      `  Levántalo con:  docker compose up -d db\n` +
      `  O indícalo con la variable de entorno NATURDEX_DB_CONTAINER.`;
    if (onFail) return onFail(msg);
    console.error('✖ ' + msg);
    process.exit(1);
  }
  cache = name;
  return cache;
}

/**
 * Ejecuta un comando de shell (mysql/mysqldump) dentro del contenedor, con `MYSQL_PWD` ya puesta.
 * `input`, si se pasa, va por stdin. Devuelve stdout; lanza si el proceso falla.
 */
function inContainer(shellCmd, input, { maxBuffer = 256 * 1024 * 1024 } = {}) {
  const args = ['exec'];
  if (input !== undefined) args.push('-i');
  args.push(container(), 'sh', '-c', `MYSQL_PWD="$MYSQL_ROOT_PASSWORD" ${shellCmd}`);
  const res = spawnSync('docker', args, { input, encoding: 'utf8', maxBuffer });
  if (res.status !== 0) {
    throw new Error(`docker exec falló (${res.status}): ${(res.stderr || '').trim() || 'sin detalle'}`);
  }
  return res.stdout;
}

/** SELECT en modo --batch (sin cabeceras ni marco). Devuelve stdout crudo. */
function query(sql, db = DB_NAME) {
  return inContainer(
    `mysql --default-character-set=utf8mb4 --batch --skip-column-names ${db ? db : ''}`.trim(),
    sql,
  );
}

/**
 * SELECT que devuelve un array de objetos. Se pide a MySQL que agregue el resultado con
 * JSON_ARRAYAGG en vez de parsear columnas separadas por tabuladores: el catálogo está lleno de
 * texto libre con tabuladores y saltos de línea, y ese parseo se rompía en silencio.
 */
function queryJson(selectListSql, fromSql, db = DB_NAME) {
  const sql = `SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(${selectListSql})), JSON_ARRAY()) ${fromSql};`;
  const out = query(sql, db).trim();
  try { return JSON.parse(out); }
  catch (e) { throw new Error('respuesta no-JSON de la BD: ' + out.slice(0, 200)); }
}

module.exports = { DB_NAME, findContainer, isContainerRunning, container, inContainer, query, queryJson };
