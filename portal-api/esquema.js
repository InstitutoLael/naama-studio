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
  `CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    marca TEXT,
    categoria TEXT NOT NULL DEFAULT 'Otros',
    unidad TEXT NOT NULL DEFAULT 'g',
    tamano REAL NOT NULL DEFAULT 1,
    stock REAL NOT NULL DEFAULT 0,
    minimo REAL NOT NULL DEFAULT 1,
    costo INTEGER,
    proveedor TEXT,
    foto_id INTEGER,
    variante TEXT,
    uso TEXT NOT NULL DEFAULT 'trabajo',
    precio_venta INTEGER,
    activo INTEGER NOT NULL DEFAULT 1,
    creado TEXT NOT NULL,
    creado_por INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS fotos (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL, datos TEXT NOT NULL, creada TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS usos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    servicio TEXT,
    registro TEXT,
    cuenta_id INTEGER,
    fecha TEXT NOT NULL,
    ts TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS usos_producto ON usos (producto_id, fecha)`,
  `CREATE TABLE IF NOT EXISTS movimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    cantidad REAL NOT NULL,
    nota TEXT,
    cuenta_id INTEGER,
    ts TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    unidades REAL NOT NULL,
    total INTEGER,
    cuenta_id INTEGER,
    fecha TEXT NOT NULL,
    ts TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER,
    texto TEXT NOT NULL,
    cantidad TEXT,
    urgente INTEGER NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'pedido',
    pedido_por INTEGER,
    ts TEXT NOT NULL,
    resuelto_por INTEGER,
    resuelto_ts TEXT,
    monto INTEGER,
    proveedor TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS compromisos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    monto INTEGER NOT NULL,
    dia INTEGER,
    pagado_mes TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    creado TEXT NOT NULL
  )`,
  // Inyecciones: Naamá paga el producto, se repone cuando la clienta paga y a Vivy se le anota solo la diferencia.
  `CREATE TABLE IF NOT EXISTS inyecciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mp_id TEXT UNIQUE,
    detalle TEXT NOT NULL,
    costo INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    dia TEXT NOT NULL,
    por TEXT,
    creado TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS iny_cobros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    iny_id INTEGER NOT NULL,
    cobrado INTEGER NOT NULL,
    clienta TEXT,
    dia TEXT NOT NULL,
    por TEXT,
    creado TEXT NOT NULL
  )`,
  // Servicios que anota Administración; cada uno se manda a la planilla del mes.
  `CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    clienta TEXT NOT NULL,
    clienta_id INTEGER,
    profesional TEXT NOT NULL,
    servicio TEXT NOT NULL,
    categoria TEXT,
    medio TEXT NOT NULL,
    monto INTEGER NOT NULL,
    propina INTEGER NOT NULL DEFAULT 0,
    comision REAL NOT NULL,
    turno TEXT,
    token TEXT NOT NULL UNIQUE,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    hoja TEXT,
    fila INTEGER,
    error TEXT,
    por TEXT,
    creado TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS servicios_fecha ON servicios (fecha)`,
  `CREATE TABLE IF NOT EXISTS cierres (
    fecha TEXT PRIMARY KEY,
    datos TEXT NOT NULL,
    efectivo INTEGER,
    nota TEXT,
    por TEXT,
    ts TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS disponibilidad (
    cuenta_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    estado TEXT NOT NULL,
    nota TEXT,
    ts TEXT NOT NULL,
    PRIMARY KEY (cuenta_id, fecha)
  )`,
  // «Mi mes»: lo que anota cada trabajadora. No va a la planilla; sirve para revisar antes de pagar.
  `CREATE TABLE IF NOT EXISTS mis_servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuenta_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    clienta TEXT,
    servicio TEXT NOT NULL,
    monto INTEGER,
    nota TEXT,
    creado TEXT NOT NULL
  )`,
  // Ficha de cada clienta: lo que el equipo debe saber antes de atenderla.
  `CREATE TABLE IF NOT EXISTS fichas (
    clienta_id INTEGER PRIMARY KEY,
    cumple TEXT,
    alergias TEXT,
    preferencias TEXT,
    notas TEXT,
    actualizado TEXT,
    por TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS formulas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clienta_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    texto TEXT NOT NULL,
    cuenta_id INTEGER,
    por TEXT,
    ts TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS avisos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clienta_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    por TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS metas (
    cuenta_id INTEGER NOT NULL,
    mes TEXT NOT NULL,
    monto INTEGER NOT NULL,
    PRIMARY KEY (cuenta_id, mes)
  )`,
  `CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    cuenta_id INTEGER,
    dias TEXT NOT NULL,
    activa INTEGER NOT NULL DEFAULT 1,
    creado TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS tareas_hechas (
    tarea_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    cuenta_id INTEGER,
    por TEXT,
    ts TEXT NOT NULL,
    PRIMARY KEY (tarea_id, fecha)
  )`,
  `CREATE TABLE IF NOT EXISTS giftcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    para TEXT NOT NULL,
    de TEXT,
    monto INTEGER,
    servicio TEXT,
    mensaje TEXT,
    diseno TEXT NOT NULL,
    vence TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activa',
    medio TEXT,
    por TEXT,
    creado TEXT NOT NULL,
    canjeada TEXT,
    canjeada_por TEXT
  )`,
  // Agenda interna: horas por persona (dos pueden atender a la vez).
  `CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    hora TEXT NOT NULL,
    minutos INTEGER NOT NULL,
    cuenta_id INTEGER NOT NULL,
    clienta TEXT NOT NULL,
    clienta_id INTEGER,
    telefono TEXT,
    servicio TEXT,
    nota TEXT,
    estado TEXT NOT NULL DEFAULT 'agendada',
    creada_por INTEGER,
    por TEXT,
    creado TEXT NOT NULL,
    visto INTEGER NOT NULL DEFAULT 0,
    recordada TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS citas_fecha ON citas (fecha, cuenta_id)`,
  // Sobrecupo: citas que se aceptan aunque la persona ya tenga a otra clienta a esa hora.
  `CREATE TABLE IF NOT EXISTS citas_sobrecupo (cita_id INTEGER PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS avisos_push (
    endpoint TEXT PRIMARY KEY,
    cuenta_id INTEGER NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    creado TEXT NOT NULL
  )`,
];

// Cambia este número cada vez que se agregue o modifique una tabla.
export const HUELLA = 'v10';

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
