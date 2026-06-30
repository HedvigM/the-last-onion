import { createCanvas } from '@napi-rs/canvas'
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const EMOJI = '🧅'
const ROTATION = -6

const EMOJI_FONTS = [
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Noto Color Emoji',
  'sans-serif',
]

/** Onion size as a fraction of the full canvas. */
const ONION_SCALE = 0.78

async function measureEmojiDraw(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const fontSize = Math.round(size * ONION_SCALE * 0.88)
  ctx.font = `${fontSize}px ${EMOJI_FONTS.map((f) => `"${f}"`).join(', ')}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate((ROTATION * Math.PI) / 180)
  ctx.fillText(EMOJI, 0, 0)
  ctx.restore()

  return canvas.toBuffer('image/png')
}

async function getPixelBounds(pngBuffer, alphaThreshold = 24) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 }
  }

  return { minX, minY, maxX, maxY }
}

async function composeIcon(svgPath, size) {
  const bgBuffer = await sharp(readFileSync(svgPath)).resize(size, size).png().toBuffer()
  const emojiBuffer = await measureEmojiDraw(size)
  const bounds = await getPixelBounds(emojiBuffer)

  const emojiW = bounds.maxX - bounds.minX + 1
  const emojiH = bounds.maxY - bounds.minY + 1
  const emojiCenterX = bounds.minX + emojiW / 2
  const emojiCenterY = bounds.minY + emojiH / 2

  const left = Math.round(size / 2 - emojiCenterX)
  const top = Math.round(size / 2 - emojiCenterY)

  return sharp(bgBuffer)
    .composite([{ input: emojiBuffer, left, top }])
    .png()
    .toBuffer()
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  let dataOffset = headerSize
  const entries = []

  for (const { size, buffer } of pngBuffers) {
    entries.push({ size, buffer, offset: dataOffset })
    dataOffset += buffer.length
  }

  const totalSize = dataOffset
  const out = Buffer.alloc(totalSize)

  out.writeUInt16LE(0, 0)
  out.writeUInt16LE(1, 2)
  out.writeUInt16LE(count, 4)

  let entryOffset = 6
  for (const { size, buffer, offset } of entries) {
    out.writeUInt8(size >= 256 ? 0 : size, entryOffset)
    out.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1)
    out.writeUInt8(0, entryOffset + 2)
    out.writeUInt8(0, entryOffset + 3)
    out.writeUInt16LE(1, entryOffset + 4)
    out.writeUInt16LE(32, entryOffset + 6)
    out.writeUInt32LE(buffer.length, entryOffset + 8)
    out.writeUInt32LE(offset, entryOffset + 12)
    entryOffset += 16
  }

  let dataPos = headerSize
  for (const { buffer } of entries) {
    buffer.copy(out, dataPos)
    dataPos += buffer.length
  }

  return out
}

async function writePng(filename, buffer) {
  const path = join(publicDir, filename)
  await sharp(buffer).png().toFile(path)
  console.log(`  wrote ${filename}`)
}

async function main() {
  console.log('Generating PWA icons…')

  const standardSvg = join(publicDir, 'icon-source.svg')
  const maskableSvg = join(publicDir, 'maskable-icon-source.svg')

  const icon512 = await composeIcon(standardSvg, 512)
  const icon192 = await sharp(icon512).resize(192, 192).png().toBuffer()
  const maskable512 = await composeIcon(maskableSvg, 512)
  const appleTouch = await sharp(icon512).resize(180, 180).png().toBuffer()
  const fav32 = await sharp(icon512).resize(32, 32).png().toBuffer()
  const fav16 = await sharp(icon512).resize(16, 16).png().toBuffer()
  const fav48 = await sharp(icon512).resize(48, 48).png().toBuffer()

  await writePng('pwa-512x512.png', icon512)
  await writePng('pwa-192x192.png', icon192)
  await writePng('maskable-icon.png', maskable512)
  await writePng('apple-touch-icon.png', appleTouch)
  await writePng('favicon-32.png', fav32)
  await writePng('favicon-16.png', fav16)

  const ico = buildIco([
    { size: 16, buffer: fav16 },
    { size: 32, buffer: fav32 },
    { size: 48, buffer: fav48 },
  ])
  writeFileSync(join(publicDir, 'favicon.ico'), ico)
  console.log('  wrote favicon.ico')

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
