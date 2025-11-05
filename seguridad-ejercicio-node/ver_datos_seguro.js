
// ver_datos_seguro.js
// Requisitos: Node 18+ (fs/promises nativo). No usa paquetes externos.
// Cumple: (1) lee archivo, (2) valida líneas "nombre;dato", (3) hace backup,
// (4) pide contraseña, (5) muestra solo nombres si la contraseña es incorrecta.

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const readline = require('readline');

// ============ CONFIGURACIÓN ============
const INPUT_FILE = process.argv[2] || 'usuarios.txt';
// Define la contraseña en variable de entorno para no hardcodearla:
const ADMIN_VIEW_PASSWORD = process.env.ADMIN_VIEW_PASSWORD || 'cambia_esta_contraseña';
// ======================================

// Utilidad: fecha compacta para nombre de backup
function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// Leer contraseña desde consola (oculta la escritura)
function promptHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const onData = (char) => {
      char = String(char);
      switch (char) {
        case '\u0004': // Ctrl-D
        case '\r':
        case '\n':
          process.stdout.write('\n');
          process.stdin.off('data', onData);
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(query + ' ' + '*'.repeat(rl.line.length));
          break;
      }
    };
    process.stdin.on('data', onData);
    rl.question(query + ' ', (answer) => {
      process.stdin.off('data', onData);
      rl.close();
      resolve(answer);
    });
  });
}

// Validar línea "nombre;dato"
function parseLine(line, lineNum) {
  const parts = line.split(';');
  if (parts.length !== 2) {
    return { ok: false, error: `Línea ${lineNum}: formato inválido (esperado "nombre;dato")`, value: null };
  }
  const nombre = parts[0].trim();
  const dato = parts[1].trim();
  if (!nombre || !dato) {
    return { ok: false, error: `Línea ${lineNum}: campos vacíos`, value: null };
  }
  return { ok: true, error: null, value: { nombre, dato } };
}

async function main() {
  // 1) Leer archivo
  const abs = path.resolve(INPUT_FILE);
  if (!fs.existsSync(abs)) {
    console.error(`❌ No se encontró el archivo: ${abs}`);
    process.exit(1);
  }
  const contenido = await fsp.readFile(abs, 'utf8');

  // 2) Verificar líneas
  const lineas = contenido.split(/\r?\n/).filter(l => l.trim().length > 0);
  const registros = [];
  const errores = [];

  lineas.forEach((l, i) => {
    const res = parseLine(l, i + 1);
    if (res.ok) registros.push(res.value);
    else errores.push(res.error);
  });

  if (errores.length) {
    console.log('⚠️ Se encontraron problemas de formato:');
    errores.forEach(e => console.log('  - ' + e));
    console.log('Solo se cargarán las líneas válidas.\n');
  }

  // 3) Hacer backup
  const backupName = `${path.basename(INPUT_FILE, path.extname(INPUT_FILE))}.backup-${stamp()}${path.extname(INPUT_FILE)}`;
  const backupPath = path.join(path.dirname(abs), backupName);
  await fsp.copyFile(abs, backupPath);
  console.log(`🗂️  Copia de seguridad creada: ${backupPath}`);

  // 4) Solicitar contraseña antes de mostrar datos
  const pass = await promptHidden('🔒 Ingresa la contraseña para ver datos completos:');

  const correcta = pass === ADMIN_VIEW_PASSWORD;
  console.log(correcta ? '✔️ Contraseña correcta.' : '❌ Contraseña incorrecta. Se mostrarán SOLO nombres.');

  // 5) Mostrar salida según autorización
  console.log('\n=== RESULTADOS ===');
  if (correcta) {
    // Modo completo: nombre + dato
    registros.forEach(r => console.log(`- ${r.nombre} | ${r.dato}`));
  } else {
    // Modo restringido: solo nombres
    registros.forEach(r => console.log(`- ${r.nombre}`));
  }

  console.log('\nTotal líneas válidas:', registros.length);
  if (errores.length) console.log('Total líneas con error de formato:', errores.length);
}

main().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
