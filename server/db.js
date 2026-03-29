const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, 'data')

function readJson(name, fallback) {
  const p = path.join(dataDir, `${name}.json`)
  if (!fs.existsSync(p)) return fallback
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(name, data) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const p = path.join(dataDir, `${name}.json`)
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
}

module.exports = { readJson, writeJson, dataDir }
