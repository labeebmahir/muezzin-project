import { PRAYER_NAMES } from '../constants/prayerNames.js'

const LOGO_SVG = `<svg width="160" height="162" viewBox="0 0 160 162" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M55.9448 27.5066C65.4171 14.2636 83.0246 5.60278 100.811 5.60278C114.687 5.60278 127.994 10.986 137.806 20.5683C147.618 30.1506 153.131 43.1472 153.133 56.6996C153.133 83.6964 131.694 105.921 104.547 107.796" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5102 107.415C7.34312 95.0442 5.60254 82.6136 20.1547 67.5311C35.4389 53.8978 44.2389 47.451 46.5846 43.5664C48.9303 47.451 57.8722 53.8978 73.1564 67.5311C87.0063 79.887 86.1398 95.0367 75.9727 107.415M17.5102 107.415H13.6032M17.5102 107.415H75.9727M75.9727 107.415H79.4091M13.6032 107.415H5.60254M13.6032 107.415V148.83C13.902 153.82 13.6032 156.151 22.6498 155.494H46.4427M79.4091 107.415H87.6189M79.4091 107.415L79.4016 149.592C80.2756 156.368 74.8821 155.18 71.4308 155.494H46.4352L46.6966 139.552" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/><path d="M98.9736 43.5664V62.2496L110.187 69.7199" stroke="#C6AA57" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// Rounded rectangle helper
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,      y + h, x,       y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x,      y,     x + r,   y,         r)
  ctx.closePath()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function shareAsImage({ prayers, hijriDate, gregorianDate, city, nextPrayerIndex, language }) {
  await document.fonts.load('700 22px Poppins')
  await document.fonts.load('600 15px Poppins')
  await document.fonts.load('400 13px Poppins')

  const logoDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG)
  const logoImg = await loadImage(logoDataUrl).catch(() => null)

  const SCALE    = 2
  const W        = 540
  const ROW_H    = 56
  const HEADER_H = 180
  const FOOTER_H = 60
  const H        = HEADER_H + prayers.length * ROW_H + FOOTER_H

  const canvas = document.createElement('canvas')
  canvas.width  = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#111612'
  ctx.fillRect(0, 0, W, H)

  // Top gold accent bar
  ctx.fillStyle = '#C6AA57'
  ctx.fillRect(0, 0, W, 4)

  // ── Logo ─────────────────────────────────────────────────────────────────
  const logoSize = 48
  const logoX = W / 2 - logoSize / 2
  const logoY = 20
  if (logoImg) {
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize * (162 / 160))
  }

  // ── App name ──────────────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 20px Poppins, sans-serif'
  ctx.fillText('Muezzin', W / 2, logoY + logoSize + 22)

  // ── Hijri date ────────────────────────────────────────────────────────────
  const dateY = logoY + logoSize + 46
  ctx.font = '600 15px Poppins, sans-serif'
  ctx.fillStyle = '#C6AA57'
  ctx.fillText(hijriDate, W / 2, dateY)

  // Gregorian date
  ctx.font = '400 12px Poppins, sans-serif'
  ctx.fillStyle = '#8aab9e'
  ctx.fillText(gregorianDate, W / 2, dateY + 20)

  // Separator line
  ctx.beginPath()
  ctx.moveTo(40, HEADER_H - 8)
  ctx.lineTo(W - 40, HEADER_H - 8)
  ctx.strokeStyle = 'rgba(198,170,87,0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  // ── Prayer rows ───────────────────────────────────────────────────────────
  const names = PRAYER_NAMES[language] ?? PRAYER_NAMES.en

  prayers.forEach((prayer, i) => {
    const rowY = HEADER_H + i * ROW_H
    const pad  = 28

    rr(ctx, pad, rowY + 4, W - pad * 2, ROW_H - 8, 12)
    ctx.fillStyle = i % 2 === 0 ? '#0B3124' : 'rgba(11,49,36,0.5)'
    ctx.fill()

    const textY = rowY + ROW_H / 2 + 6

    ctx.font = '600 15px Poppins, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'left'
    ctx.fillText(names[prayer.key] ?? prayer.name, pad + 18, textY)

    ctx.font = '600 15px Poppins, sans-serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'right'
    ctx.fillText(prayer.timeStr, W - pad - 18, textY)
  })

  // ── Footer: district ─────────────────────────────────────────────────────
  const footerY = HEADER_H + prayers.length * ROW_H
  ctx.font = '400 12px Poppins, sans-serif'
  ctx.fillStyle = '#8aab9e'
  ctx.textAlign = 'center'
  ctx.fillText('📍  ' + (city || ''), W / 2, footerY + 30)

  // Bottom gold accent bar
  ctx.fillStyle = '#C6AA57'
  ctx.fillRect(0, H - 4, W, 4)

  // ── Share / download ──────────────────────────────────────────────────────
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('Failed to generate image')); return }

      const file = new File([blob], 'prayer-times.png', { type: 'image/png' })

      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Prayer Times',
            text: `Prayer times — ${city}`,
          })
        } else {
          const url = URL.createObjectURL(blob)
          const a   = document.createElement('a')
          a.href     = url
          a.download = 'prayer-times.png'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
        resolve()
      } catch (err) {
        if (err.name === 'AbortError') resolve()
        else reject(err)
      }
    }, 'image/png')
  })
}
