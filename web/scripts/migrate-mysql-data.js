#!/usr/bin/env node
/**
 * Importe les données exportées de MySQL (Railway) vers PostgreSQL (Supabase) via Prisma.
 * Source : web/prisma/migration-data/mysql_export.sql (export phpMyAdmin des tables
 * artiste, category_spectacle, lieu, photo_addictionnel, settings, spectacle).
 *
 * Usage :
 *   node scripts/migrate-mysql-data.js --dry-run   (parse et affiche les compteurs, n'écrit rien)
 *   node scripts/migrate-mysql-data.js             (importe réellement dans la base)
 */

const fs = require('fs');
const path = require('path');
const { Parser } = require('node-sql-parser');
const { PrismaClient } = require('@prisma/client');

const DUMP_PATH = path.join(__dirname, '..', 'prisma', 'migration-data', 'mysql_export.sql');
const DRY_RUN = process.argv.includes('--dry-run');
const TABLES = ['artiste', 'category_spectacle', 'lieu', 'photo_addictionnel', 'settings', 'spectacle'];

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    current += char;
    if (char === '\\' && inString) {
      current += sql[++i];
      continue;
    }
    if (char === "'") inString = !inString;
    if (char === ';' && !inString) {
      statements.push(current.trim());
      current = '';
    }
  }
  return statements;
}

function unescapeMysqlString(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

function extractInserts(sql, tableName) {
  const parser = new Parser();
  const marker = new RegExp(`INSERT INTO \`${tableName}\``, 'i');
  const statements = splitStatements(sql)
    .map((s) => {
      const idx = s.search(marker);
      return idx === -1 ? null : s.slice(idx);
    })
    .filter(Boolean);

  const rows = [];
  for (const statement of statements) {
    const [ast] = parser.astify(statement, { database: 'mysql' });
    const columns = ast.columns;
    for (const valueList of ast.values.values) {
      const row = {};
      valueList.value.forEach((cell, i) => {
        row[columns[i]] = cell.type === 'null' ? null : unescapeMysqlString(cell.value);
      });
      rows.push(row);
    }
  }
  return rows;
}

function toTimestamp(mysqlValue) {
  if (!mysqlValue) return null;
  return new Date(mysqlValue.replace(' ', 'T') + 'Z');
}

function toDate(mysqlValue) {
  return new Date(mysqlValue + 'T00:00:00Z');
}

function toTime(mysqlValue) {
  return new Date('1970-01-01T' + mysqlValue + 'Z');
}

async function main() {
  const sql = fs.readFileSync(DUMP_PATH, 'utf8');

  const raw = {};
  for (const table of TABLES) {
    raw[table] = extractInserts(sql, table);
  }

  console.log('Lignes trouvées dans le dump :');
  for (const table of TABLES) {
    console.log(`  ${table}: ${raw[table].length}`);
  }

  const data = {
    categorieSpectacle: raw.category_spectacle.map((r) => ({
      id: r.id,
      code: r.code,
      label: r.label,
    })),
    artiste: raw.artiste.map((r) => ({
      id: r.id,
      name: r.name,
      photo: r.photo,
      createdAt: toTimestamp(r.created_at),
    })),
    lieu: raw.lieu.map((r) => ({
      id: r.id,
      imagePath: r.image_path,
      isMain: Number(r.is_main) === 1,
    })),
    photoAdditionnelle: raw.photo_addictionnel.map((r) => ({
      id: r.id,
      imagePath: r.image_path,
      categoryId: r.category_id,
      createdAt: toTimestamp(r.created_at),
    })),
    settings: raw.settings.map((r) => ({
      key: r.key,
      value: r.value,
      updatedAt: toTimestamp(r.updated_at),
    })),
    spectacle: raw.spectacle.map((r) => ({
      id: r.id,
      title: r.title,
      img: r.img,
      description: r.description,
      dateSpectacle: toDate(r.date_spectacle),
      heureSpectacle: toTime(r.heure_spectacle),
      lieu: r.lieu,
      lienSpectacle: r.lien_spectacle,
      categoryId: r.category_id,
    })),
  };

  if (DRY_RUN) {
    console.log('\n--dry-run : aucune écriture en base. Exemple de ligne par table :');
    for (const [model, rows] of Object.entries(data)) {
      console.log(`\n${model}:`, rows[0] ?? '(vide)');
    }
    return;
  }

  const prisma = new PrismaClient();
  try {
    console.log('\nImport en base...');
    await prisma.categorieSpectacle.createMany({ data: data.categorieSpectacle, skipDuplicates: true });
    await prisma.artiste.createMany({ data: data.artiste, skipDuplicates: true });
    await prisma.lieu.createMany({ data: data.lieu, skipDuplicates: true });
    await prisma.photoAdditionnelle.createMany({ data: data.photoAdditionnelle, skipDuplicates: true });
    await prisma.settings.createMany({ data: data.settings, skipDuplicates: true });
    await prisma.spectacle.createMany({ data: data.spectacle, skipDuplicates: true });

    console.log('Réajustement des séquences auto-increment...');
    for (const table of ['artiste', 'category_spectacle', 'lieu', 'photo_addictionnel', 'spectacle']) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
      );
    }

    console.log('Import terminé.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
