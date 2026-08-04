'use strict';
/*
 * Lector mínimo de ficheros dBASE (.dbf) — sin dependencias.
 * Usado para leer la tabla de atributos del shapefile y la tabla Habi<NN>.dbf del MITECO.
 */
const fs = require('fs');

// Lee un .dbf y devuelve { nRec, fields:[{name,type,len}], rows:[{campo:valor,...}] }.
// maxRows limita la lectura (opcional). Codificación latin1 (la del dato del MITECO).
function readDbf(file, maxRows) {
  const b = fs.readFileSync(file);
  const nRec = b.readUInt32LE(4), hSize = b.readUInt16LE(8), rSize = b.readUInt16LE(10);
  const fields = [];
  let o = 32;
  while (b[o] !== 0x0d) {
    const name = b.toString('latin1', o, o + 11).replace(/\0.*$/, '');
    const type = String.fromCharCode(b[o + 11]); // byte 11 del descriptor = tipo
    const len = b[o + 16];                        // byte 16 = longitud
    fields.push({ name, type, len });
    o += 32;
  }
  const rows = [];
  const lim = Math.min(nRec, maxRows == null ? nRec : maxRows);
  for (let r = 0; r < lim; r++) {
    let p = hSize + r * rSize + 1; // +1: salta el byte de borrado
    const rec = {};
    for (const f of fields) { rec[f.name] = b.toString('latin1', p, p + f.len).trim(); p += f.len; }
    rows.push(rec);
  }
  return { nRec, fields, rows };
}

module.exports = { readDbf };
