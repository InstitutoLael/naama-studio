// Llamadas a /api/portal. Toda escritura lleva el encabezado x-naama (lo exige el servidor).

export async function api(camino, { metodo = 'GET', body } = {}) {
  const headers = {};
  if (metodo !== 'GET') {
    headers['Content-Type'] = 'application/json';
    headers['x-naama'] = '1';
  }
  let res;
  try {
    res = await fetch(`/api/portal/${camino}`, {
      method: metodo,
      headers,
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Sin conexión. Revisa tu internet e inténtalo de nuevo.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta vacía o no JSON
  }
  if (!res.ok || !data?.ok) {
    const err = new Error(data?.error ?? 'Algo falló. Inténtalo de nuevo.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const post = (camino, body = {}) => api(camino, { metodo: 'POST', body });
