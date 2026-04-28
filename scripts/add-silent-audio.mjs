// Adds a silent AAC audio track to MP4 files so Instagram Reels accepts them.
// Usage: node scripts/add-silent-audio.mjs [file1.mp4] [file2.mp4] ...
// If no args, processes all files in public/reels/ that don't end in -audio.mp4

import { execSync } from 'child_process'
import { readdirSync, existsSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ffmpeg = resolve(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe')
const reelsDir = resolve(__dirname, '../public/reels')

let files = process.argv.slice(2)

if (!files.length) {
  files = readdirSync(reelsDir)
    .filter(f => f.endsWith('.mp4') && !f.endsWith('-audio.mp4'))
    .map(f => resolve(reelsDir, f))
}

for (const input of files) {
  if (!existsSync(input)) {
    console.error(`Not found: ${input}`)
    continue
  }
  const base = basename(input, '.mp4')
  const outDir = dirname(input)
  const output = resolve(outDir, `${base}-audio.mp4`)

  console.log(`Adding silent audio: ${basename(input)} → ${basename(output)}`)
  execSync(
    `"${ffmpeg}" -y -i "${input}" -f lavfi -i anullsrc=r=44100:cl=mono -c:v copy -c:a aac -shortest "${output}"`,
    { stdio: 'inherit' }
  )
  console.log(`Done: ${output}`)
}
