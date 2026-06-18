import fs from 'fs'
import path from 'path'

const TMP_DIR = '/tmp/clinbase'
const SRC_DIR = path.join(process.cwd(), 'data')

export function dataPath(filename: string): string {
  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })
    const tmp = path.join(TMP_DIR, filename)
    if (!fs.existsSync(tmp)) {
      const src = path.join(SRC_DIR, filename)
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, tmp)
      } else {
        fs.writeFileSync(tmp, '[]', 'utf-8')
      }
    }
    return tmp
  } catch {
    // local dev fallback
    return path.join(SRC_DIR, filename)
  }
}
