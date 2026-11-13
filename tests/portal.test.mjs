// Pruebas de la API del portal contra una base SQLite en memoria. Correr con: npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1 } from './d1-memoria.mjs';
import { manejar } from '../portal-api/router.js';
import { reiniciarEsquema } from '../portal-api/esquema.js';

const BASE = 'https://naamastudio.cl/api/portal/';
let env;

beforeEach(() => {
  reiniciarEsquema();
  env = { DB: crearD1(), SETUP_SECRET: 'secreto-de-prueba' };
});

/** Cliente con su propio «navegador»: guarda la cookie de sesión. */
const cliente = (ip = '1.1.1.1') => {
  let cookie = '';
  const pedir = async (camino, { metodo = 'GET', body, headers = {} } = {}) => {
    const h = { 'CF-Connecting-IP': ip, ...headers };
    if (cookie) h.Cookie = cookie;
    if (metodo !== 'GET') {
      h['Content-Type'] = 'application/json';
      if (!('x-naama' in headers)) h['x-naama'] = '1';
    }
    const res = await manejar(new Request(BASE + camino, { method: metodo, headers: h, body: body ? JSON.stringify(body) : undefined }), env);
    const sc = res.headers.get('Set-Cookie');
    if (sc) cookie = sc.split(';')[0];
    return { status: res.status, data: await res.json(), setCookie: sc };
  };
  return { pedir, post: (c, body, o = {}) => pedir(c, { metodo: 'POST', body, ...o }), get cookie() { return cookie; } };
};

const configurar = async (c = cliente()) => {
  const r = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Diego', email: 'Diego@Naama.cl', clave: 'claveDiego123' });
  assert.equal(r.status, 201);
  return c;
};

test('primer ingreso: crea la cuenta de Administración una sola vez', async () => {
  const c = cliente();
  assert.equal((await c.pedir('estado')).data.configurado, false);
  const malo = await c.post('configurar', { secreto: 'otro', nombre: 'X', email: 'x@x.cl', clave: '12345678' });
  assert.equal(malo.status, 403);
  await configurar(c);
  const est = await c.pedir('estado');
  assert.equal(est.data.configurado, true);
  assert.equal(est.data.cuenta.email, 'diego@naama.cl');
  assert.equal(est.data.cuenta.rol, 'admin');
  const otra = await cliente('2.2.2.2').post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Y', email: 'y@y.cl', clave: '12345678' });
  assert.equal(otra.status, 409);
});

test('la cookie de sesión es HttpOnly, Secure y SameSite=Strict, y dura 30 días', async () => {
  const c = cliente();
  const r = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'Diego', email: 'd@n.cl', clave: 'claveDiego123' });
  assert.match(r.setCookie, /HttpOnly/);
  assert.match(r.setCookie, /Secure/);
  assert.match(r.setCookie, /SameSite=Strict/);
  assert.match(r.setCookie, /Max-Age=2592000/);
});

test('nunca se guarda ni se devuelve la clave en texto plano', async () => {
  await configurar();
  const fila = await env.DB.prepare('SELECT * FROM cuentas').first();
  assert.notEqual(fila.hash, 'claveDiego123');
  assert.equal(fila.hash.length, 64);
  assert.equal(fila.sal.length, 32);
  const est = await cliente().post('entrar', { email: 'diego@naama.cl', clave: 'claveDiego123' });
  assert.equal(est.data.cuenta.hash, undefined);
  assert.equal(est.data.cuenta.sal, undefined);
});

test('escrituras sin el encabezado x-naama o desde otro sitio se rechazan', async () => {
  const c = cliente();
  const sinHeader = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'D', email: 'd@n.cl', clave: '12345678' }, { headers: { 'x-naama': '0' } });
  assert.equal(sinHeader.status, 403);
  const otroSitio = await c.post('configurar', { secreto: 'secreto-de-prueba', nombre: 'D', email: 'd@n.cl', clave: '12345678' }, { headers: { Origin: 'https://malo.com' } });
  assert.equal(otroSitio.status, 403);
});

test('entrar: clave mala da 401 y tras 5 intentos bloquea ese correo', async () => {
  await configurar();
  const c = cliente('9.9.9.9');
  for (let i = 0; i < 5; i++) assert.equal((await c.post('entrar', { email: 'diego@naama.cl', clave: 'mala' })).status, 401);
  assert.equal((await c.post('entrar', { email: 'diego@naama.cl', clave: 'claveDiego123' })).status, 429);
  // El correo inexistente responde igual que una clave mala
  assert.equal((await cliente('8.8.8.8').post('entrar', { email: 'nadie@naama.cl', clave: 'x' })).status, 401);
});

test('Administración crea cuentas con clave temporal y la persona debe crear la suya', async () => {
  const admin = await configurar();
  const r = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia', extras: [] });
  assert.equal(r.status, 201);
  assert.match(r.data.claveTemporal, /^[a-z2-9]{5}-[a-z2-9]{5}$/);
  assert.equal(r.data.cuenta.debeCambiar, true);

  const gaby = cliente('3.3.3.3');
  const e = await gaby.post('entrar', { email: 'gaby@naama.cl', clave: r.data.claveTemporal });
  assert.equal(e.status, 200);
  assert.equal(e.data.cuenta.debeCambiar, true);
  // Mientras no cambie la clave, no puede usar nada más
  assert.equal((await gaby.post('clave', { actual: 'otra', nueva: 'nuevaClave1' })).status, 401);
  assert.equal((await gaby.post('clave', { actual: r.data.claveTemporal, nueva: 'corta' })).status, 400);
  assert.equal((await gaby.post('clave', { actual: r.data.claveTemporal, nueva: 'nuevaClave1' })).status, 200);
  const est = await gaby.pedir('estado');
  assert.equal(est.data.cuenta.debeCambiar, false);
});

test('Gaby (socia) no ve plata ni caja ni cuentas; Vivy (dueña) ve todo menos cuentas', async () => {
  const admin = await configurar();
  const g = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia', extras: [] });
  const v = await admin.post('cuentas', { nombre: 'Vivy', email: 'vivy@naama.cl', rol: 'duena', extras: [] });
  assert.deepEqual(g.data.cuenta.permisos, []);
  assert.ok(v.data.cuenta.permisos.includes('finanzas'));
  assert.ok(v.data.cuenta.permisos.includes('caja'));
  assert.ok(!v.data.cuenta.permisos.includes('cuentas'));

  const gaby = cliente('4.4.4.4');
  await gaby.post('entrar', { email: 'gaby@naama.cl', clave: g.data.claveTemporal });
  await gaby.post('clave', { actual: g.data.claveTemporal, nueva: 'gabyClave1' });
  assert.equal((await gaby.pedir('cuentas')).status, 403);
  assert.equal((await gaby.post('cuentas', { nombre: 'X', email: 'x@x.cl', rol: 'admin' })).status, 403);
});

test('permisos extra por persona y validación de roles', async () => {
  const admin = await configurar();
  const val = await admin.post('cuentas', { nombre: 'Valeria', email: 'vale@naama.cl', rol: 'equipo', extras: ['insumos'] });
  assert.deepEqual(val.data.cuenta.permisos, ['insumos']);
  assert.equal((await admin.post('cuentas', { nombre: 'X', email: 'x@naama.cl', rol: 'jefa' })).status, 400);
  assert.equal((await admin.post('cuentas', { nombre: 'X', email: 'x@naama.cl', rol: 'equipo', extras: ['todo'] })).status, 400);
  assert.equal((await admin.post('cuentas', { nombre: 'Vale 2', email: 'VALE@naama.cl', rol: 'equipo' })).status, 409);
});

test('desactivar cierra la sesión; restablecer clave invalida la anterior', async () => {
  const admin = await configurar();
  const k = await admin.post('cuentas', { nombre: 'Kata', email: 'kata@naama.cl', rol: 'equipo' });
  const id = k.data.cuenta.id;
  const kata = cliente('5.5.5.5');
  await kata.post('entrar', { email: 'kata@naama.cl', clave: k.data.claveTemporal });
  assert.ok((await kata.pedir('estado')).data.cuenta);

  const rest = await admin.post(`cuentas/${id}/restablecer`, {});
  assert.equal(rest.status, 200);
  assert.equal((await kata.pedir('estado')).data.cuenta, null, 'la sesión vieja se cierra');
  assert.equal((await cliente('6.6.6.6').post('entrar', { email: 'kata@naama.cl', clave: k.data.claveTemporal })).status, 401);
  await kata.post('entrar', { email: 'kata@naama.cl', clave: rest.data.claveTemporal });
  assert.ok((await kata.pedir('estado')).data.cuenta);

  await admin.post(`cuentas/${id}`, { activa: false });
  assert.equal((await kata.pedir('estado')).data.cuenta, null);
  assert.equal((await cliente('7.7.7.7').post('entrar', { email: 'kata@naama.cl', clave: rest.data.claveTemporal })).status, 401);
});

test('nadie puede quitarse su propio acceso de Administración', async () => {
  const admin = await configurar();
  const yo = (await admin.pedir('estado')).data.cuenta;
  assert.equal((await admin.post(`cuentas/${yo.id}`, { rol: 'equipo' })).status, 400);
  assert.equal((await admin.post(`cuentas/${yo.id}`, { activa: false })).status, 400);
});

test('salir borra la sesión', async () => {
  const admin = await configurar();
  await admin.post('salir', {});
  assert.equal((await admin.pedir('estado')).data.cuenta, null);
  assert.equal((await admin.pedir('cuentas')).status, 401);
});

test('lista de cuentas marca quién entró hoy (hora de Chile)', async () => {
  const admin = await configurar();
  await admin.post('cuentas', { nombre: 'Allison', email: 'allison@naama.cl', rol: 'admin' });
  const r = await admin.pedir('cuentas');
  assert.equal(r.status, 200);
  const diego = r.data.cuentas.find((c) => c.nombre === 'Diego');
  const allison = r.data.cuentas.find((c) => c.nombre === 'Allison');
  assert.equal(diego.entroHoy, true);
  assert.equal(allison.entroHoy, false);
  assert.match(r.data.hoy, /^\d{4}-\d{2}-\d{2}$/);
});

/* ── Clientas ── */
import { limpiarNombre, normalizarTelefono, leerVcf, mostrarTelefono } from '../src/portal/contactos.js';

test('limpia nombres de contactos guardados como «Clienta …»', () => {
  assert.deepEqual(limpiarNombre('Clienta María uñas 💅'), { nombre: 'María', nota: 'uñas' });
  assert.deepEqual(limpiarNombre('cliente JAVIERA soto (balayage)'), { nombre: 'Javiera Soto', nota: 'balayage' });
  assert.deepEqual(limpiarNombre('Carmen Gloria - Naamá'), { nombre: 'Carmen Gloria', nota: '' });
  assert.equal(limpiarNombre('Clienta 2').nombre, '');
});

test('normaliza teléfonos chilenos', () => {
  assert.equal(normalizarTelefono('9 1234 5678'), '+56912345678');
  assert.equal(normalizarTelefono('+56 9 1234-5678'), '+56912345678');
  assert.equal(normalizarTelefono('56912345678'), '+56912345678');
  assert.equal(normalizarTelefono('(09) 1234 5678'), '+56912345678');
  assert.equal(normalizarTelefono('12345678'), '+56912345678');
  assert.equal(normalizarTelefono('123'), null);
  assert.equal(mostrarTelefono('+56912345678'), '+56 9 1234 5678');
});

test('lee un archivo .vcf del iPhone', () => {
  const vcf = 'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Clienta;Ana;;;\r\nFN:Ana Clienta Uñas\r\nTEL;type=CELL;type=VOICE;type=pref:+56 9 8765 4321\r\nEND:VCARD\r\nBEGIN:VCARD\r\nVERSION:3.0\r\nFN:Sin Fono\r\nEND:VCARD\r\n';
  assert.deepEqual(leerVcf(vcf), [{ original: 'Ana Clienta Uñas', telefono: '+56 9 8765 4321' }]);
});

const crearEquipo = async () => {
  const admin = await configurar();
  const g = await admin.post('cuentas', { nombre: 'Gaby', email: 'gaby@naama.cl', rol: 'socia' });
  const gaby = cliente('4.4.4.4');
  await gaby.post('entrar', { email: 'gaby@naama.cl', clave: g.data.claveTemporal });
  await gaby.post('clave', { actual: g.data.claveTemporal, nueva: 'gabyClave1' });
  return { admin, gaby };
};

test('Gaby sube una clienta pero no ve números; Administración sí', async () => {
  const { admin, gaby } = await crearEquipo();
  const r = await gaby.post('clientas', { contactos: [{ nombre: 'Clienta Fernanda uñas', telefono: '9 1111 2222' }], origen: 'contacto' });
  assert.equal(r.status, 201);
  assert.equal(r.data.creadas, 1);
  const vistaGaby = await gaby.pedir('clientas');
  assert.equal(vistaGaby.data.verNumeros, false);
  assert.equal(vistaGaby.data.clientas[0].nombre, 'Fernanda');
  assert.equal(vistaGaby.data.clientas[0].telefono, undefined);
  const vistaAdmin = await admin.pedir('clientas');
  assert.equal(vistaAdmin.data.clientas[0].telefono, '+56911112222');
  assert.equal(vistaAdmin.data.clientas[0].nota, 'uñas');
  // Gaby no puede importar listas ni editar
  assert.equal((await gaby.post('clientas', { contactos: [{ nombre: 'A', telefono: '911112223' }, { nombre: 'B', telefono: '911112224' }] })).status, 403);
  assert.equal((await gaby.post(`clientas/${vistaAdmin.data.clientas[0].id}`, { nombre: 'X' })).status, 403);
});

test('importar lista: salta repetidas e inválidas', async () => {
  const { admin } = await crearEquipo();
  await admin.post('clientas', { contactos: [{ nombre: 'Ana', telefono: '+56 9 3333 4444' }] });
  const r = await admin.post('clientas', {
    origen: 'archivo',
    contactos: [
      { nombre: 'Clienta Ana', telefono: '933334444' },
      { nombre: 'Bea cejas', telefono: '955556666' },
      { nombre: 'Bea otra vez', telefono: '+56955556666' },
      { nombre: 'Sin número', telefono: '12' },
      ...Array.from({ length: 120 }, (_, i) => ({ nombre: `Clienta ${String.fromCharCode(65 + (i % 26))}ita`, telefono: `97${String(i).padStart(7, '0')}` })),
    ],
  });
  assert.equal(r.status, 201);
  assert.equal(r.data.creadas, 121);
  assert.equal(r.data.repetidas, 2);
  assert.equal(r.data.invalidas, 1);
  const lista = await admin.pedir('clientas');
  assert.equal(lista.data.clientas.length, 122);
});

test('«Vino hoy» anota una visita por día y calcula hace cuánto no viene', async () => {
  const { admin, gaby } = await crearEquipo();
  await gaby.post('clientas', { contactos: [{ nombre: 'Rosa', telefono: '922223333' }] });
  const id = (await gaby.pedir('clientas')).data.clientas[0].id;
  const a = await gaby.post(`clientas/${id}/visita`, { fecha: '2026-09-01' });
  assert.equal(a.data.clienta.visitas, 1);
  assert.ok(a.data.clienta.diasSinVenir > 30);
  const b = await gaby.post(`clientas/${id}/visita`, {});
  assert.equal(b.data.clienta.diasSinVenir, 0);
  assert.equal(b.data.clienta.visitas, 2);
  const c = await admin.post(`clientas/${id}/visita`, {});
  assert.equal(c.data.yaEstaba, true);
  assert.equal(c.data.clienta.visitas, 2);
  assert.equal((await gaby.post(`clientas/${id}/visita`, { fecha: '2999-01-01' })).status, 400);
  const v = await admin.pedir(`clientas/${id}/visitas`);
  assert.equal(v.data.visitas.length, 2);
  assert.equal(v.data.visitas[0].anotadaPor, 'Gaby');
});

/* ── Insumos y compras ── */
const FOTO = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';

test('insumos: crear con foto, anotar uso con la pesa y descontar stock', async () => {
  const { admin, gaby } = await crearEquipo();
  const r = await gaby.post('insumos', { nombre: 'Decolorante', marca: 'Wella', categoria: 'Color', unidad: 'g', tamano: 500, envases: 2, minimo: 1, costo: 20000, foto: FOTO });
  assert.equal(r.status, 201);
  assert.equal(r.data.producto.stock, 1000);
  assert.equal(r.data.producto.costo, undefined, 'Gaby no ve costos');
  const id = r.data.producto.id;
  const foto = await manejar(new Request(`${BASE}insumos/foto/${r.data.producto.fotoId}`, { headers: { Cookie: gaby.cookie } }), env);
  assert.equal(foto.headers.get('Content-Type'), 'image/webp');
  // Gaby no puede poner precios: lo hace Administración.
  assert.equal((await admin.post(`insumos/${id}`, { costo: 20000 })).status, 200);

  assert.equal((await gaby.post('insumos/uso', { servicio: 'Balayage', items: [{ productoId: id, cantidad: 60 }] })).status, 200);
  await gaby.post('insumos/uso', { servicio: 'Balayage', items: [{ productoId: id, cantidad: '40' }] });
  const lista = await admin.pedir('insumos');
  const p = lista.data.productos[0];
  assert.equal(p.stock, 900);
  assert.equal(p.envases, 1.8);
  assert.equal(p.consumo30, 100);
  assert.equal(p.costo, 20000, 'Administración sí ve costos');

  const datos = await admin.pedir('insumos-datos');
  assert.equal(datos.data.porServicio[0].servicio, 'Balayage');
  assert.equal(datos.data.porServicio[0].veces, 2);
  assert.equal(datos.data.porServicio[0].productos[0].promedio, 50);
  assert.equal(datos.data.porServicio[0].costoPromedio, 2000); // 50 g × $40/g
  assert.equal((await gaby.pedir('insumos-datos')).status, 403);

  assert.equal((await gaby.post('insumos/uso', { servicio: 'X', items: [{ productoId: id, cantidad: 0 }] })).status, 400);
  assert.equal((await gaby.post(`insumos/${id}/ajuste`, { envases: 3 })).status, 403);
  assert.equal((await admin.post(`insumos/${id}/ajuste`, { envases: 3 })).status, 200);
  assert.equal((await admin.pedir('insumos')).data.productos[0].stock, 1500);
});

test('compras: Gaby pide, Administración marca comprado y suma stock', async () => {
  const { admin, gaby } = await crearEquipo();
  const p = (await admin.post('insumos', { nombre: 'Cera', unidad: 'g', tamano: 800, envases: 0, minimo: 1 })).data.producto;
  assert.equal(p.bajo, true);
  assert.equal((await gaby.post('compras', { productoId: p.id, urgente: true })).status, 201);
  assert.equal((await gaby.post('compras', { productoId: p.id })).data.yaEstaba, true);
  await gaby.post('compras', { texto: 'Algodón', cantidad: '2 bolsas' });
  const lista = await gaby.pedir('compras');
  assert.equal(lista.data.pedidos.length, 2);
  assert.equal(lista.data.puedeResolver, false);
  const pedido = lista.data.pedidos.find((x) => x.productoId === p.id);
  assert.equal(pedido.urgente, true);
  assert.equal((await gaby.post(`compras/${pedido.id}`, { estado: 'comprado' })).status, 403);
  assert.equal((await admin.post(`compras/${pedido.id}`, { estado: 'comprado', monto: 29100, envases: 2 })).status, 200);
  const prod = (await admin.pedir('insumos')).data.productos.find((x) => x.id === p.id);
  assert.equal(prod.stock, 1600);
  const vista = await gaby.pedir('compras');
  assert.equal(vista.data.pedidos.find((x) => x.id === pedido.id).monto, undefined, 'Gaby no ve el monto');
});

test('tonos y ventas: variantes del mismo tinte y «Vendí uno»', async () => {
  const { admin, gaby } = await crearEquipo();
  const a = (await admin.post('insumos', { nombre: 'Tinte Igora', marca: 'Schwarzkopf', categoria: 'Color', unidad: 'g', tamano: 60, envases: 3, variante: '7.1 Rubio ceniza' })).data.producto;
  const b = (await admin.post('insumos', { nombre: 'Tinte Igora', marca: 'Schwarzkopf', categoria: 'Color', unidad: 'g', tamano: 60, envases: 2, variante: '9.0' })).data.producto;
  assert.equal(a.variante, '7.1 Rubio ceniza');
  await gaby.post('insumos/uso', { servicio: 'Tintura', items: [{ productoId: a.id, cantidad: 30 }, { productoId: b.id, cantidad: 15 }] });
  const ps = (await admin.pedir('insumos')).data.productos;
  assert.equal(ps.find((x) => x.id === a.id).stock, 150);
  assert.equal(ps.find((x) => x.id === b.id).stock, 105);
  const s = (await admin.post('insumos', { nombre: 'Protector térmico', unidad: 'u', tamano: 1, envases: 10, uso: 'venta', precioVenta: 17999 })).data.producto;
  assert.equal(s.precioVenta, 17999, 'el precio de venta lo ven todas');
  assert.equal((await gaby.post(`insumos/${a.id}/venta`, { unidades: 1 })).status, 400, 'un producto de trabajo no se vende');
  assert.equal((await gaby.post(`insumos/${s.id}/venta`, { unidades: 2 })).status, 200);
  assert.equal((await admin.pedir('insumos')).data.productos.find((x) => x.id === s.id).stock, 8);
  const d = await admin.pedir('insumos-datos');
  assert.equal(d.data.ventas[0].total, 35998);
  const c = await gaby.post('compras', { productoId: a.id });
  assert.equal(c.status, 201);
  assert.match((await gaby.pedir('compras')).data.pedidos[0].texto, /7\.1/);
});

/* ── Plata ── */
test('plata: solo finanzas, lee pagos de Mercado Pago y calcula disponible', async () => {
  const { admin, gaby } = await crearEquipo();
  assert.equal((await gaby.pedir('plata')).status, 403, 'Gaby no ve la plata');
  const sinLlave = await admin.pedir('plata');
  assert.equal(sinLlave.data.conectado, false);

  const ahora = new Date().toISOString();
  env.MP_ACCESS_TOKEN = 'TEST-llave';
  env.MP_FETCH = async (url, opciones) => {
    assert.equal(opciones.headers.Authorization, 'Bearer TEST-llave');
    if (url.endsWith('/users/me')) return new Response(JSON.stringify({ id: 99 }));
    assert.match(url, /payments\/search/);
    return new Response(
      JSON.stringify({
        results: [
          { id: 1, status: 'approved', date_created: ahora, date_approved: ahora, transaction_amount: 30000, fee_details: [{ amount: 1050 }], transaction_details: { net_received_amount: 28950 }, money_release_status: 'pending', money_release_date: ahora, payment_type_id: 'credit_card' },
          { id: 2, status: 'approved', date_created: ahora, date_approved: ahora, transaction_amount: 10000, fee_details: [{ amount: 350 }], transaction_details: { net_received_amount: 9650 }, money_release_status: 'released', payment_type_id: 'debit_card' },
          { id: 3, status: 'rejected', date_created: ahora, transaction_amount: 5000, fee_details: [] },
          { id: 4, status: 'approved', collector_id: 555, date_created: ahora, date_approved: ahora, transaction_amount: 14990, fee_details: [], payment_type_id: 'account_money' },
          { id: 6, status: 'approved', operation_type: 'account_fund', collector_id: 99, date_created: ahora, date_approved: ahora, transaction_amount: 20000, fee_details: [], payment_type_id: 'bank_transfer', money_release_status: 'released' },
          { id: 7, status: 'approved', collector_id: 555, date_created: ahora, date_approved: ahora, transaction_amount: 900000, description: 'Arriendo local', fee_details: [], payment_type_id: 'account_money' },
          { id: 8, status: 'approved', collector_id: 555, date_created: ahora, date_approved: ahora, transaction_amount: 49809, description: 'Enel', fee_details: [], payment_type_id: 'account_money' },
          { id: 5, status: 'authorized', collector_id: 99, date_created: ahora, transaction_amount: 5500, fee_details: [], payment_type_id: 'account_money' },
        ],
      }),
    );
  };
  await admin.post('plata/saldo', { monto: '1.500.000' });
  await admin.post('plata/compromisos', { nombre: 'Arriendo', monto: '900.000', dia: 28 });
  await admin.post('plata/compromisos', { nombre: 'Luz (Enel)', monto: '80.000', dia: 10 });
  const r = await admin.pedir('plata');
  assert.equal(r.data.conectado, true);
  assert.equal(r.data.hoyMP.bruto, 60000);
  assert.equal(r.data.hoyMP.comision, 1400);
  assert.equal(r.data.hoyMP.neto, 58600);
  assert.equal(r.data.porLiberar.total, 28950);
  assert.equal(r.data.disponible, 1500000, 'el arriendo pagado por MP se marca solo');
  assert.equal(r.data.compromisos.find((c) => c.nombre === 'Arriendo').pagado, true);
  const luz = r.data.compromisos.find((c) => c.nombre.startsWith('Luz'));
  assert.equal(luz.pagado, true, 'se reconoce por el nombre aunque el monto cambie');
  assert.equal(luz.pagadoMonto, 49809);
  assert.equal(r.data.salidas.length, 3);
  assert.equal(r.data.porDia.length, 14);
  assert.deepEqual(r.data.ultimos.map((p) => p.id).sort(), [1, 2, 6]);
  // Inyecciones: compra de 3 por $102.552; se cobra una en $120.000 → para Vivy la diferencia.
  const cv = r.data.salidas.find((x) => x.id === 7);
  assert.ok(cv);
  await admin.post('plata/inyecciones', { costo: 102552, cantidad: 3, detalle: 'Cruz Verde' });
  let iny = (await admin.pedir('plata')).data;
  assert.equal(iny.inyResumen.porReponer, 102552);
  await admin.post(`plata/inyecciones/${iny.inyecciones[0].id}`, { cobrado: 120000, clienta: 'Naty' });
  iny = (await admin.pedir('plata')).data;
  assert.equal(iny.inyResumen.paraVivy, 120000 - 34184);
  assert.equal(iny.inyResumen.porReponer, 68368);
  const otra = await admin.post('plata/compromisos', { nombre: 'arriendo', monto: '900.000', dia: 28 });
  assert.equal(otra.status, 409);
  const arriendo = r.data.compromisos.find((c) => c.nombre === 'Arriendo');
  await admin.post(`plata/compromisos/${arriendo.id}`, { pagado: false });
  assert.equal((await admin.pedir('plata')).data.disponible, 600000, 'si lo desmarcan no vuelve a marcarse solo');
  await admin.post(`plata/compromisos/${arriendo.id}`, { pagado: true });
  assert.equal((await admin.pedir('plata')).data.disponible, 1500000);
});

/** Crea una cuenta y entra con ella (ya con clave propia). */
const crearYEntrar = async (admin, nombre, rol, ip) => {
  const email = `${nombre.toLowerCase()}@naama.cl`;
  const r = await admin.post('cuentas', { nombre, email, rol, extras: [] });
  const c = cliente(ip);
  await c.post('entrar', { email, clave: r.data.claveTemporal });
  await c.post('clave', { actual: r.data.claveTemporal, nueva: `${nombre}Clave123` });
  return c;
};

test('anotar servicios: se guardan, el Apps Script viene a buscar la fila y queda en la planilla', async () => {
  const admin = await configurar();
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '5.5.5.5');
  assert.equal((await gaby.pedir('servicios')).status, 403);

  // Sin planilla conectada: queda guardado y pendiente.
  let r = await admin.post('servicios', { clienta: 'Rosita Jara', medio: 'Mercado Pago', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: '23.000' }] });
  assert.equal(r.status, 201);
  assert.equal(r.data.servicios[0].estado, 'pendiente');
  assert.equal(r.data.servicios[0].comision, 0.5);

  assert.equal((await admin.post('planilla/conectar', { url: 'https://evil.example/exec' })).status, 400);
  assert.equal((await admin.post('planilla/conectar', { url: 'https://script.google.com/macros/s/AKfycbx_abcdefghijklmnopqrstuvwxyz/exec' })).status, 200);

  // El «Apps Script» de prueba: recibe solo el código y pide la fila al portal, sin sesión.
  const filas = [];
  env.PLANILLA_FETCH = async (url, opciones) => {
    assert.match(url, /script\.google\.com/);
    const { token } = JSON.parse(opciones.body);
    assert.match(token, /^[0-9a-f]{64}$/);
    const fila = await cliente('9.9.9.9').pedir(`planilla/fila/${token}`);
    assert.equal(fila.status, 200);
    filas.push(fila.data.fila);
    return new Response(JSON.stringify({ ok: true, hoja: 'INGRESO NOV 26', fila: 54 + filas.length }));
  };
  r = await admin.post('servicios/reintentar');
  assert.equal(r.data.listos, 1);
  assert.equal(filas[0].maquina, 23000);
  assert.equal(filas[0].efectivo, '');

  r = await admin.post('servicios', {
    clienta: 'Naty',
    medio: 'Transferencia',
    items: [
      { profesional: 'VALERIA - ESTILISTA', servicio: 'Color', monto: 55000 },
      { profesional: 'VALERIA - ESTILISTA', servicio: 'Corte', monto: 16000, propina: 2000 },
    ],
  });
  assert.equal(r.data.servicios.length, 2);
  assert.ok(r.data.servicios.every((x) => x.estado === 'en_planilla'));
  assert.equal(r.data.servicios[0].comision, 0.4, 'Valeria: color al 40%');
  assert.equal(r.data.servicios[1].comision, 0.5, 'Valeria: corte al 50%');
  assert.equal(filas[2].propina, 2000);
  assert.equal(filas[1].efectivo, 55000);

  // Ya en planilla: el código no vuelve a servir.
  const usados = await env.DB.prepare('SELECT token FROM servicios').all();
  assert.equal((await cliente('9.9.9.9').pedir(`planilla/fila/${usados.results[0].token}`)).status, 404);
  assert.equal((await cliente('9.9.9.9').pedir(`planilla/fila/${'0'.repeat(64)}`)).status, 404);

  const lista = await admin.pedir('servicios');
  assert.equal(lista.data.servicios.length, 3);
  assert.equal(lista.data.pendientes, 0);
});

test('cierre de caja: compara lo anotado con Mercado Pago y el efectivo contado', async () => {
  const admin = await configurar();
  env.MP_ACCESS_TOKEN = 'TEST';
  const ahora = new Date().toISOString();
  env.MP_FETCH = async (url) => {
    if (url.endsWith('/users/me')) return new Response(JSON.stringify({ id: 1 }));
    return new Response(
      JSON.stringify({
        results: [
          { id: 1, collector_id: 1, status: 'approved', date_created: ahora, date_approved: ahora, transaction_amount: 23000, fee_details: [{ amount: 600 }], payment_type_id: 'debit_card' },
          { id: 2, collector_id: 1, status: 'approved', operation_type: 'account_fund', date_created: ahora, date_approved: ahora, transaction_amount: 16000, fee_details: [], payment_type_id: 'bank_transfer' },
        ],
      }),
    );
  };
  await admin.post('servicios', { clienta: 'A', medio: 'Mercado Pago', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: 23000 }] });
  await admin.post('servicios', { clienta: 'B', medio: 'Transferencia', items: [{ profesional: 'VIVY - MASOTERAPEUTA', servicio: 'Corte', monto: 16000 }] });
  await admin.post('servicios', { clienta: 'C', medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Bozo', monto: 3500 }] });
  const c = await admin.pedir('caja');
  assert.equal(c.data.mp.maquina, 23000);
  assert.equal(c.data.mp.transferencias, 16000);
  assert.equal(c.data.anotado.Efectivo, 3500);
  let r = await admin.post('caja', { efectivo: 3500 });
  assert.equal(r.data.cierre.cuadra, true);
  r = await admin.post('caja', { efectivo: 1000, nota: 'faltan' });
  assert.equal(r.data.cierre.cuadra, false);
  assert.equal(r.data.cierre.difEfectivo, -2500);
  assert.equal((await admin.pedir('caja')).data.anteriores.length, 1);
});

test('disponibilidad: cada una marca sus días y todas ven al equipo', async () => {
  const admin = await configurar();
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '6.6.6.6');
  const d = await kata.pedir('disponibilidad');
  assert.equal(d.data.dias.length, 14);
  assert.ok(d.data.dias.every((f) => new Date(`${f}T12:00:00Z`).getUTCDay() !== 0), 'sin domingos');
  assert.equal((await kata.post('disponibilidad', { fechas: d.data.dias.slice(0, 2), estado: 'manana' })).status, 200);
  assert.equal((await kata.post('disponibilidad', { fecha: '2020-01-01', estado: 'todo' })).status, 400);
  assert.equal((await kata.post('disponibilidad', { fecha: d.data.dias[0], estado: 'cualquiera' })).status, 400);
  const vista = await admin.pedir('disponibilidad');
  const k = vista.data.equipo.find((p) => p.nombre === 'Kata');
  assert.equal(k.marcas[d.data.dias[0]].estado, 'manana');
  await kata.post('disponibilidad', { fecha: d.data.dias[0], estado: '' });
  assert.equal((await kata.pedir('disponibilidad')).data.yo.marcas[d.data.dias[0]], undefined);
});

test('Mi mes: Gaby anota lo suyo, no ve lo de otras, y Administración lo cruza con lo anotado', async () => {
  const admin = await configurar();
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '7.7.7.7');
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '8.8.8.8');
  await gaby.post('mi-mes', { servicio: 'Manos', clienta: 'Rosita', monto: '23.000' });
  await gaby.post('mi-mes', { servicio: 'Pedicure', clienta: 'Ely', monto: 25000 });
  await gaby.post('mi-mes', { servicio: 'Bozo', clienta: 'Rosita', monto: 3500 });
  await kata.post('mi-mes', { servicio: 'Manos', monto: 21000 });
  await admin.post('servicios', { clienta: 'Rosita Jara', medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: 23000 }] });
  await admin.post('servicios', { clienta: 'Olga', medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Bozo', monto: 3500 }] });

  const suyo = await gaby.pedir('mi-mes');
  assert.equal(suyo.data.servicios.length, 3);
  assert.equal(suyo.data.total, 51500);
  assert.equal(suyo.data.cruce, undefined, 'ella no ve el cruce');
  const idKata = (await admin.pedir('mi-mes')).data.equipo.find((p) => p.nombre === 'Kata').id;
  assert.equal((await gaby.pedir(`mi-mes?cuenta=${idKata}`)).status, 403);

  const idGaby = (await admin.pedir('mi-mes')).data.equipo.find((p) => p.nombre === 'Gaby').id;
  const cruce = (await admin.pedir(`mi-mes?cuenta=${idGaby}`)).data.cruce;
  assert.equal(cruce.filas.find((f) => f.servicio === 'Manos').coincide.servicio, 'Manos', 'no se confunde con el bozo de la misma clienta');
  assert.equal(cruce.filas.find((f) => f.servicio === 'Bozo').coincide.clienta, 'Olga', 'mismo monto y servicio, aunque escriba otro nombre');
  assert.equal(cruce.filas.find((f) => f.servicio === 'Pedicure').coincide, null);
  assert.equal(cruce.soloNuestros.length, 0);

  const mio = suyo.data.servicios.find((x) => x.servicio === 'Pedicure');
  assert.equal((await kata.post(`mi-mes/${mio.id}`, { borrar: true })).status, 404);
  assert.equal((await gaby.post(`mi-mes/${mio.id}`, { borrar: true })).status, 200);
});

test('Vivy ve los servicios pero no los anota ni borra; Gaby no los ve', async () => {
  const admin = await configurar();
  const vivy = await crearYEntrar(admin, 'Vivy', 'duena', '11.1.1.1');
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '11.1.1.2');
  const r = await admin.post('servicios', { clienta: 'Ana', medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: 23000 }] });
  const v = await vivy.pedir('servicios');
  assert.equal(v.status, 200);
  assert.equal(v.data.puedeEditar, false);
  assert.equal(v.data.servicios.length, 1);
  assert.equal((await vivy.post('servicios', { clienta: 'X', medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: 1 }] })).status, 403);
  assert.equal((await vivy.post(`servicios/${r.data.servicios[0].id}`, { borrar: true })).status, 403);
  assert.equal((await gaby.pedir('servicios')).status, 403);
  assert.equal((await vivy.pedir('caja')).status, 200, 'Vivy sí hace la caja');
});

test('caja: Vivy suma tarjeta, transferencias y efectivo por separado', async () => {
  const admin = await configurar();
  env.MP_ACCESS_TOKEN = 'TEST';
  const ahora = new Date().toISOString();
  env.MP_FETCH = async (url) => {
    if (url.endsWith('/users/me')) return new Response(JSON.stringify({ id: 1 }));
    return new Response(
      JSON.stringify({
        results: [
          { id: 1, collector_id: 1, status: 'approved', date_created: ahora, date_approved: ahora, transaction_amount: 50000, fee_details: [], payment_type_id: 'credit_card' },
          { id: 2, collector_id: 1, status: 'approved', date_created: ahora, date_approved: ahora, transaction_amount: 30000, fee_details: [], payment_type_id: 'bank_transfer' },
        ],
      }),
    );
  };
  let r = await admin.post('caja', { tarjeta: '50.000', transferencia: '30000', efectivo: 12000 });
  assert.equal(r.data.cierre.cuadra, true);
  assert.equal(r.data.cierre.totalContado, 92000);
  r = await admin.post('caja', { tarjeta: 45000, transferencia: 30000, efectivo: 12000 });
  assert.equal(r.data.cierre.cuadra, false);
  assert.equal(r.data.cierre.difMaquina, -5000);
});

test('ficha de clienta: alergias, cumpleaños y fórmulas; «te toca» y cumpleaños de la semana', async () => {
  const admin = await configurar();
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '12.1.1.1');
  await admin.post('clientas', { contactos: [{ nombre: 'Rosita Jara', telefono: '+56911112222' }], origen: 'contacto' });
  const c = (await admin.pedir('clientas')).data.clientas[0];
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  const cumple = hoy.slice(5);
  assert.equal((await kata.post(`clientas/${c.id}/ficha`, { cumple: '13-45' })).status, 400);
  assert.equal((await kata.post(`clientas/${c.id}/ficha`, { cumple, alergias: 'Amoníaco', preferencias: 'Té verde' })).status, 200);
  assert.equal((await kata.post(`clientas/${c.id}/formulas`, { texto: '7.1 + 20 vol, 45 g' })).status, 201);
  const f = await kata.pedir(`clientas/${c.id}/ficha`);
  assert.equal(f.data.ficha.alergias, 'Amoníaco');
  assert.equal(f.data.formulas.length, 1);
  const cumples = await kata.pedir('cumpleanos');
  assert.equal(cumples.data.cumples[0].dias, 0);
  assert.equal(cumples.data.cumples[0].telefono, undefined, 'sin números para el equipo');

  // Vino hace 25 días a hacerse las manos: le toca (cada 21).
  const hace25 = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date(Date.now() - 25 * 86400000));
  await admin.post('servicios', { fecha: hace25, clienta: 'Rosita Jara', clientaId: c.id, medio: 'Efectivo', items: [{ profesional: 'GABY - MANICURISTA', servicio: 'Manos', monto: 23000 }] });
  assert.equal((await kata.pedir('te-toca')).status, 403);
  let t = await admin.pedir('te-toca');
  assert.equal(t.data.toca.length, 1);
  assert.equal(t.data.toca[0].cada, 21);
  assert.equal(t.data.cumples.length, 1);
  await admin.post(`te-toca/${c.id}`, { tipo: 'toca' });
  t = await admin.pedir('te-toca');
  assert.equal(t.data.toca.length, 0, 'ya avisada: sale de la lista hasta que vuelva');
});

test('aseo: Administración crea tareas por persona y día; cada una marca las suyas', async () => {
  const admin = await configurar();
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '13.1.1.1');
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '13.1.1.2');
  const idKata = (await admin.pedir('cuentas')).data.cuentas.find((x) => x.nombre === 'Kata').id;
  const todos = [0, 1, 2, 3, 4, 5, 6];
  assert.equal((await kata.post('tareas', { texto: 'X', dias: todos })).status, 403);
  await admin.post('tareas', { texto: 'Esterilizar alicates', cuentaId: idKata, dias: todos });
  await admin.post('tareas', { texto: 'Barrer', dias: todos });
  let k = await kata.pedir('tareas');
  assert.equal(k.data.mias.length, 2);
  const g = await gaby.pedir('tareas');
  assert.equal(g.data.mias.length, 1, 'Gaby solo ve «Barrer» como suya');
  const ester = k.data.mias.find((x) => x.texto.startsWith('Ester'));
  assert.equal((await gaby.post(`tareas/${ester.id}/hecha`, {})).status, 403);
  await kata.post(`tareas/${ester.id}/hecha`, {});
  k = await kata.pedir('tareas');
  assert.equal(k.data.mias.find((x) => x.id === ester.id).hecha.por, 'Kata');
});

test('gift cards: crear con código, canjear una sola vez; metas y reseñas', async () => {
  const admin = await configurar();
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '14.1.1.1');
  assert.equal((await gaby.pedir('giftcards')).status, 403);
  assert.equal((await admin.post('giftcards', { para: 'Ana' })).status, 400);
  const r = await admin.post('giftcards', { para: 'Ana', de: 'Tomás', monto: '30.000', diseno: 'arcilla', mensaje: 'Para ti' });
  assert.equal(r.status, 201);
  assert.match(r.data.giftcard.codigo, /^NAAMA-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  assert.equal(r.data.giftcard.monto, 30000);
  const id = r.data.giftcard.id;
  assert.equal((await admin.post(`giftcards/${id}`, { accion: 'canjear' })).data.giftcard.estado, 'canjeada');
  assert.equal((await admin.post(`giftcards/${id}`, { accion: 'canjear' })).status, 409);

  await gaby.post('mi-mes/meta', { monto: '400.000' });
  await gaby.post('mi-mes', { servicio: 'Manos', monto: 100000 });
  const m = await gaby.pedir('mi-mes');
  assert.equal(m.data.meta, 400000);
  assert.equal(m.data.total, 100000);
  assert.match((await gaby.pedir('resenas')).data.url, /writereview\?placeid=ChIJ/);
  assert.equal((await gaby.post('resenas', { url: 'https://evil.cl' })).status, 403);
  assert.equal((await admin.pedir('plata/margen')).status, 200);
  assert.equal((await gaby.pedir('plata/margen')).status, 403);
});

test('agenda: horas por persona, choques, avisos de citas nuevas y alergias a la vista', async () => {
  const admin = await configurar();
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '15.1.1.1');
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '15.1.1.2');
  const ids = Object.fromEntries((await admin.pedir('cuentas')).data.cuentas.map((x) => [x.nombre, x.id]));
  const manana = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date(Date.now() + 86400000));
  await admin.post('clientas', { contactos: [{ nombre: 'Rosita Jara', telefono: '+56911112222' }], origen: 'contacto' });
  const cid = (await admin.pedir('clientas')).data.clientas[0].id;
  await admin.post(`clientas/${cid}/ficha`, { alergias: 'Amoníaco' });

  // Diego agenda a Gaby y a Kata a la misma hora: se puede, son personas distintas.
  let r = await admin.post('agenda', { fecha: manana, hora: '15:00', cuentaId: ids.Gaby, clienta: 'Rosita Jara', servicio: 'Manos' });
  assert.equal(r.status, 201);
  r = await admin.post('agenda', { fecha: manana, hora: '15:00', cuentaId: ids.Kata, clienta: 'Ely', servicio: 'Pedicure' });
  assert.equal(r.status, 201);
  // Pero no dos a la vez con Gaby.
  r = await admin.post('agenda', { fecha: manana, hora: '15:30', cuentaId: ids.Gaby, clienta: 'Otra', servicio: 'Bozo' });
  assert.equal(r.status, 409);
  assert.match(r.data.error, /Rosita/);

  // Gaby ve el aviso de hora nueva; al abrir la agenda queda vista.
  let n = await gaby.pedir('agenda/nuevas');
  assert.equal(n.data.nuevas.length, 1);
  const ag = await gaby.pedir(`agenda?fecha=${manana}`);
  assert.equal(ag.data.citas.length, 2);
  const suya = ag.data.citas.find((c) => c.clienta === 'Rosita Jara');
  assert.equal(suya.alergias, 'Amoníaco');
  assert.equal(suya.minutos, 60);
  assert.equal(suya.telefono, undefined, 'Gaby no ve números');
  n = await gaby.pedir('agenda/nuevas');
  assert.equal(n.data.nuevas.length, 0);
  // Admin sí ve el número (para el recordatorio).
  assert.equal((await admin.pedir(`agenda?fecha=${manana}`)).data.citas.find((c) => c.clienta === 'Rosita Jara').telefono, '+56911112222');

  // Kata solo agenda en su propia columna.
  assert.equal((await kata.post('agenda', { fecha: manana, hora: '17:00', cuentaId: ids.Gaby, clienta: 'X' })).status, 403);
  assert.equal((await kata.post('agenda', { fecha: manana, hora: '17:00', clienta: 'Mía' })).status, 201);
  await kata.post(`agenda/${suya.id}`, { estado: 'no-vino' }).then((x) => assert.equal(x.status, 403));
  await gaby.post(`agenda/${suya.id}`, { estado: 'no-vino' });
  await admin.post('agenda', { fecha: manana, hora: '18:00', cuentaId: ids.Gaby, clienta: 'rosita jara' });
  const otra = (await admin.pedir(`agenda?fecha=${manana}`)).data.citas.find((c) => c.hora === '18:00');
  assert.equal(otra.faltas, 1);
});

test('aseo por turnos: se reparte entre las que marcaron que vienen', async () => {
  const admin = await configurar();
  const gaby = await crearYEntrar(admin, 'Gaby', 'socia', '16.1.1.1');
  const kata = await crearYEntrar(admin, 'Kata', 'equipo', '16.1.1.2');
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  await gaby.post('disponibilidad', { fecha: hoy, estado: 'todo' });
  await kata.post('disponibilidad', { fecha: hoy, estado: 'manana' });
  const todos = [0, 1, 2, 3, 4, 5, 6];
  await admin.post('tareas', { lote: [{ texto: 'Barrer', cuentaId: -1, dias: todos }, { texto: 'Toallas', cuentaId: -1, dias: todos }] });
  const g = await gaby.pedir('tareas');
  const k = await kata.pedir('tareas');
  assert.equal(g.data.mias.length + k.data.mias.length, 2);
  assert.equal(g.data.mias.length, 1, 'una para cada una');
  assert.match(g.data.mias[0].quien, /Gaby \(turno\)/);
});
