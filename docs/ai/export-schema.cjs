// Validate the committed logical schema: node docs/ai/export-schema.cjs [--check]
const fs = require('node:fs')
const path = require('node:path')

const schemaPath = path.join(__dirname, 'schema.json')
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const modules = schema.modules ?? []
const tables = schema.tables ?? []

if (!modules.length || !tables.length) throw Error('Пустая схема или отсутствует карта модулей.')

const moduleIds = new Set()
const assignedTables = new Map()
for (const module of modules) {
  if (moduleIds.has(module.id)) throw Error(`Повтор модуля: ${module.id}`)
  moduleIds.add(module.id)
  for (const tableName of module.tables ?? []) {
    if (assignedTables.has(tableName)) throw Error(`Повторное назначение таблицы: ${tableName}`)
    assignedTables.set(tableName, module.id)
  }
}

const tableNames = new Set()
let fields = 0
let foreignKeyFields = 0
for (const table of tables) {
  if (tableNames.has(table.name)) throw Error(`Повтор таблицы: ${table.name}`)
  tableNames.add(table.name)
  if (!moduleIds.has(table.module)) throw Error(`Неизвестный модуль ${table.module} у ${table.name}`)
  if (assignedTables.get(table.name) !== table.module) throw Error(`Несогласован модуль таблицы: ${table.name}`)
  if (!table.fields?.length || !table.fields.some(field => field.keys?.includes('PK'))) {
    throw Error(`Нет полей или PK: ${table.name}`)
  }
  const names = new Set()
  for (const field of table.fields) {
    if (names.has(field.name)) throw Error(`Повтор поля ${table.name}.${field.name}`)
    names.add(field.name)
    fields += 1
    if (field.keys?.includes('FK')) foreignKeyFields += 1
  }
}

for (const tableName of assignedTables.keys()) {
  if (!tableNames.has(tableName)) throw Error(`Таблица модуля не описана: ${tableName}`)
}

const actual = { modules: modules.length, tables: tables.length, fields, foreignKeyFields }
if (JSON.stringify(schema.counts) !== JSON.stringify(actual)) {
  throw Error(`Неверные counts: ожидалось ${JSON.stringify(actual)}, записано ${JSON.stringify(schema.counts)}`)
}

console.log(`schema.json корректен: ${JSON.stringify(actual)}`)

