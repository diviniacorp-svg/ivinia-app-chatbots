// Re-encodes Remotion MP4s to Instagram Reels spec:
// - yuv420p (limited range, not yuvj420p)
// - AAC audio 44.1kHz
// - H.264 High profile
// Usage: node scripts/fix-reels-for-instagram.mjs

import { execSync } from 'child_process'
import { readdirSync, existsSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ffmpeg = resolve(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe')
const reelsDir = resolve(__dirname, '../public/reels')

const files = readdirSync(reelsDir)
  .filter(f => f.endsWith('.mp4') && !f.endsWith('-ig.mp4') && !f.endsWith('-audio.mp4'))
  .map(f => resolve(reelsDir, f))

for (const input of files) {
  if (!existsSync(input)) continue
  const base = basename(input, '.mp4')
  const output = resolve(reelsDir, `${base}-ig.mp4`)

  console.log(`Re-encoding for Instagram: ${basename(input)} → ${basename(output)}`)
  // -vf format=yuv420p: convert from yuvj420p to yuv420p (limited range)
  // -c:v libx264 -profile:v high -level 4.0: H.264 High @ Level 4.0
  // -f lavfi -i anullsrc: add silent audio if no audio track
  execSync(
    `"${ffmpeg}" -y -i "${input}" -f lavfi -i anullsrc=r=44100:cl=stereo -map 0:v:0 -map 1:a:0 -vf "format=yuv420p" -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -c:a aac -ar 44100 -b:a 128k -shortest "${output}"`,
    { stdio: 'inherit' }
  )
  console.log(`Done: ${output}`)
}
