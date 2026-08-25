#!/usr/bin/env node
'use strict';
/*
 * dev-server.js — sirve `Frontend/` por HTTP para poder mirar la app sin instalar nada.
 *
 * El problema que resuelve
 * -----------------------
 * La app no tiene paso de build, pero **tampoco se puede abrir con `file://`**: usa módulos ES, y el
 * navegador los bloquea por CORS desde el sistema de ficheros. La receta escrita en el repo es
 * `php -S localhost:8000 -t .` (`.claude/launch.json`), y eso da por hecho que hay PHP instalado —
 * que es cierto en el contenedor y no siempre en la máquina de quien revisa la interfaz.
 *
 * Esto es lo mínimo para verla: ficheros estáticos, `index.html` de índice y el `Content-Type`
 * correcto, que en un `.js` no es opcional (un módulo servido como `text/plain` no lo ejecuta
 * ningún navegador). **No sustituye a `php -S`**: no sirve `Backend/Api/`, así que la app cae al
 * `park.json` empaquetado — que para repasar el pintado es justo lo que interesa, porque es lo que
 * ve un dispositivo sin cobertura.
 *
 * Uso:
 *     node Tools/dev-server.js [--puerto 8000] [--raiz Frontend]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { arg, num } = require('./lib/cli');
const { ROOT } = require('./lib/io');

const PUERTO = num('puerto', 8000);
const RAIZ = path.resolve(ROOT, arg('raiz', 'Frontend'));

// El tipo importa de verdad en tres: `.js` (módulo ES), `.json` (los datos del parque) y `.pmtiles`
// (el paquete de teselas, que se pide por rangos). El resto es cortesía.
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.pmtiles': 'application/octet-stream',
};

http.createServer((req, res) => {
  const url = decodeURIComponent(String(req.url || '/').split('?')[0]);
  // La ruta se resuelve y DESPUÉS se comprueba que sigue dentro de la raíz: un `..` en la URL no
  // puede sacar al servidor de `Frontend/`.
  let destino = path.resolve(RAIZ, '.' + url);
  if (!destino.startsWith(RAIZ)) { res.writeHead(403).end('403'); return; }
  if (fs.existsSync(destino) && fs.statSync(destino).isDirectory()) destino = path.join(destino, 'index.html');
  if (!fs.existsSync(destino)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 ' + url); return; }

  const cuerpo = fs.readFileSync(destino);
  res.writeHead(200, {
    'content-type': TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream',
    'content-length': cuerpo.length,
    // Sin esto el service worker sirve la versión anterior mientras se está revisando un cambio.
    'cache-control': 'no-store',
  });
  res.end(cuerpo);
}).listen(PUERTO, () => {
  console.log(`NaturDex en http://localhost:${PUERTO}/  (raíz: ${RAIZ})`);
  console.log('Sin Backend/Api: la app cae al park.json empaquetado, como un dispositivo sin cobertura.');
});
