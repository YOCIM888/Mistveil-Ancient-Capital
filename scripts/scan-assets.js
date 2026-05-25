import { readdir, writeFile } from 'node:fs/promises'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const IMG_EXTS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp'])
const VID_EXTS = new Set(['.mp4', '.webm', '.ogg'])
const AUD_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac'])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...await walk(full))
    } else if (e.isFile()) {
      const ext = extname(e.name).toLowerCase()
      if (IMG_EXTS.has(ext) || VID_EXTS.has(ext) || AUD_EXTS.has(ext)) {
        files.push(full)
      }
    }
  }

  return files
}

async function main() {
  const allFiles = await walk(publicDir)
  const assets = allFiles.map(f => {
    const rel = relative(publicDir, f).replace(/\\/g, '/')
    const ext = extname(f).toLowerCase()
    let type = 'image'
    if (VID_EXTS.has(ext)) type = 'video'
    else if (AUD_EXTS.has(ext)) type = 'audio'
    return { path: '/' + rel, type }
  })

  const outPath = join(publicDir, 'assets.json')
  await writeFile(outPath, JSON.stringify(assets, null, 2), 'utf-8')
  console.log(`✅ assets.json generated with ${assets.length} assets`)
}

main().catch(err => {
  console.error('❌ Failed to scan assets:', err)
  process.exit(1)
})
