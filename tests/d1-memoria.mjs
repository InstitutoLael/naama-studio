// Imita la base D1 de Cloudflare con SQLite en memoria (node:sqlite), para probar la API real.
import { DatabaseSync } from 'node:sqlite';

class Consulta {
  constructor(db, sql, args = []) {
    this.db = db;
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    if (args.length > 90) throw new Error('D1: demasiadas variables en una consulta (máx. ~90)');
    return new Consulta(this.db, this.sql, args);
  }
  stmt() {
    return this.db.prepare(this.sql);
  }
  async first() {
    return this.stmt().get(...this.args) ?? null;
  }
  async all() {
    return { results: this.stmt().all(...this.args), success: true };
  }
  async run() {
    const r = this.stmt().run(...this.args);
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
}

export function crearD1() {
  const db = new DatabaseSync(':memory:');
  return {
    prepare: (sql) => new Consulta(db, sql),
    async batch(consultas) {
      db.exec('BEGIN');
      try {
        const out = [];
        for (const c of consultas) out.push(await c.run());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    async exec(sql) {
      db.exec(sql);
    },
  };
}
