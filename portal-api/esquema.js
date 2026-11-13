// Tablas del portal en D1. asegurarEsquema() las crea o actualiza sola.
// Guarda una «huella» del esquema: si no cambió, hace una sola consulta y sigue.

const TABLAS = [
  `CREATE TABLE IF NOT EXISTS meta (clave TEXT PRIMARY KEY, valor TEXT)`,
  `CREATE TABLE IF NOT EXISTS cuentas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL,
    extras TEXT NOT NULL DEFAULT '[]',
    hash TEXT NOT NULL,
    sal TEXT NOT NULL,
    debe_cambiar INTEGER NOT NULL DEFAULT 1,
    activa INTEGER NOT NULL DEFAULT 1,
    demo INTEGER NOT NULL DEFAULT 0,
    creada TEXT NOT NULL,
    creada_por INTEGER,
    ultimo_ingreso TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sesiones (
    token_hash TEXT PRIMARY KEY,
    cuenta_id INTEGER NOT NULL,
    creada TEXT NOT NULL,
    vence TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sesiones_cuenta ON sesiones (cuenta_id)`,
  `CREATE TABLE IF NOT EXISTS intentos (clave TEXT NOT NULL, ts INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS intentos_clave ON intentos (clave, ts)`,
  `CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id INTEGER,
    tipo TEXT NOT NULL,
    detalle TEXT,
    ts TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS clientas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL UNIQUE,
    nota TEXT,
    origen TEXT NOT NULL,
    creada TEXT NOT NULL,
    creada_por INTEGER,
    ultima_visita TEXT,
    visitas INTEGER NOT NULL DEFAULT 0,
    activa INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS visitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clienta_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    cuenta_id INTEGER,
    ts TEXT NOT NULL,
    UNIQUE (clienta_id, fecha)
  )`,
];

// Cambia este número cada vez que se agregue o modifique una tabla.
export const HUELLA = 'v2';

let listo = false;

export async function asegurarEsquema(db) {
  if (listo) return;
  try {
    const fila = await db.prepare(`SELECT valor FROM meta WHERE clave = 'esquema'`).first();
    if (fila?.valor === HUELLA) {
      listo = true;
      return;
    }
  } catch {
    // La tabla meta todavía no existe: se crea abajo.
  }
  await db.batch([
    ...TABLAS.map((sql) => db.prepare(sql)),
    db.prepare(`INSERT INTO meta (clave, valor) VALUES ('esquema', ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor`).bind(HUELLA),
  ]);
  listo = true;
}

/** Solo para las pruebas: obliga a revisar el esquema otra vez. */
export const reiniciarEsquema = () => {
  listo = false;
};
