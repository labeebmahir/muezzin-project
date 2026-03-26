import { PRAYER_NAMES } from '../constants/prayerNames.js'
import { COLORS } from '../constants/colors.js'

const LOGO_SVG = `<svg width="160" height="162" viewBox="0 0 160 162" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M55.9448 27.5066C65.4171 14.2636 83.0246 5.60278 100.811 5.60278C114.687 5.60278 127.994 10.986 137.806 20.5683C147.618 30.1506 153.131 43.1472 153.133 56.6996C153.133 83.6964 131.694 105.921 104.547 107.796" stroke="${COLORS.gold}" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5102 107.415C7.34312 95.0442 5.60254 82.6136 20.1547 67.5311C35.4389 53.8978 44.2389 47.451 46.5846 43.5664C48.9303 47.451 57.8722 53.8978 73.1564 67.5311C87.0063 79.887 86.1398 95.0367 75.9727 107.415M17.5102 107.415H13.6032M17.5102 107.415H75.9727M75.9727 107.415H79.4091M13.6032 107.415H5.60254M13.6032 107.415V148.83C13.902 153.82 13.6032 156.151 22.6498 155.494H46.4427M79.4091 107.415H87.6189M79.4091 107.415L79.4016 149.592C80.2756 156.368 74.8821 155.18 71.4308 155.494H46.4352L46.6966 139.552" stroke="${COLORS.gold}" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/><path d="M98.9736 43.5664V62.2496L110.187 69.7199" stroke="${COLORS.gold}" stroke-width="11.2054" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const PRAYER_ICONS = {
  fajr:    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#c)"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 14.1657 23.4263 16.1975 22.4225 17.9515C21.6321 17.0232 20.5898 16.3159 19.4014 15.9351C18.1308 11.9145 14.3714 8.99956 9.93066 8.99956C5.60157 8.99974 1.91951 11.7699 0.560173 15.6342C0.196311 14.4879 0 13.2669 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#C6AA57"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.93066 10.9996C5.64683 10.9998 2.15636 14.3963 2.00511 18.6433C2.00172 18.7385 2 18.8342 2 18.9302C2 23.3104 5.55079 26.8616 9.93066 26.8619C11.1061 26.8619 12.2192 26.6038 13.2227 26.1451L14.165 25.7144L15.0605 26.2359C15.7432 26.6333 16.5324 26.8618 17.3789 26.8619C19.9309 26.8619 22 24.7927 22 22.2408C22 21.293 21.7143 20.4108 21.2237 19.6766C20.6499 18.8177 19.7958 18.1614 18.791 17.8394L17.8057 17.524L17.4941 16.5376C16.4787 13.3247 13.4738 10.9996 9.93066 10.9996Z" fill="#C6AA57"/></g><defs><clipPath id="c"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>`,
  sunrise: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 18C24 16.4241 23.6896 14.8637 23.0866 13.4078C22.4835 11.9519 21.5996 10.629 20.4853 9.51472C19.371 8.40042 18.0481 7.5165 16.5922 6.91345C15.1363 6.31039 13.5759 6 12 6C10.4241 6 8.86371 6.31039 7.4078 6.91345C5.95189 7.5165 4.62902 8.40042 3.51472 9.51472C2.40041 10.629 1.5165 11.9519 0.913445 13.4078C0.310389 14.8637 0 16.4241 0 18L12 18H24Z" fill="#C6AA57" fill-opacity="0.5"/><path d="M19 18C19 17.0807 18.8189 16.1705 18.4672 15.3212C18.1154 14.4719 17.5998 13.7003 16.9497 13.0503C16.2997 12.4002 15.5281 11.8846 14.6788 11.5328C13.8295 11.1811 12.9193 11 12 11C11.0807 11 10.1705 11.1811 9.32122 11.5328C8.47194 11.8846 7.70026 12.4002 7.05025 13.0503C6.40024 13.7003 5.88463 14.4719 5.53284 15.3212C5.18106 16.1705 5 17.0807 5 18L12 18H19Z" fill="#C6AA57"/></svg>`,
  dhuhr:   `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#C6AA57" fill-opacity="0.5"/><path d="M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z" fill="#C6AA57"/></svg>`,
  asr:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 14.1658 23.4262 16.1976 22.4224 17.9516C21.632 17.0234 20.5898 16.3161 19.4014 15.9353C19.2078 15.3227 18.9564 14.7357 18.6536 14.1808C16.9693 11.0941 13.6947 8.99976 9.93066 8.99976C9.29449 8.99978 8.6723 9.05963 8.06939 9.17397C7.06454 9.36454 6.11328 9.7065 5.24022 10.1752C3.28935 11.2226 1.72895 12.903 0.833716 14.9416C0.734201 15.1682 0.642905 15.3992 0.560206 15.6343C0.196323 14.4879 0 13.2669 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#C6AA57" fill-opacity="0.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M19 12C19 12.7615 18.8784 13.4945 18.6536 14.1808C16.9693 11.0941 13.6947 8.99976 9.93066 8.99976C9.29449 8.99978 8.6723 9.05963 8.06939 9.17397C7.06454 9.36454 6.11328 9.7065 5.24022 10.1752C6.04299 7.19409 8.76527 5 12 5C15.866 5 19 8.13401 19 12Z" fill="#C6AA57"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9.93066 10.9996C5.64683 10.9998 2.15636 14.3963 2.00511 18.6433C2.00172 18.7385 2 18.8342 2 18.9302C2 23.3104 5.55079 26.8616 9.93066 26.8619C11.1061 26.8619 12.2192 26.6038 13.2227 26.1451L14.165 25.7144L15.0605 26.2359C15.7432 26.6333 16.5324 26.8618 17.3789 26.8619C19.9309 26.8619 22 24.7927 22 22.2408C22 21.293 21.7143 20.4108 21.2237 19.6766C20.6499 18.8177 19.7958 18.1614 18.791 17.8394L17.8057 17.524L17.4941 16.5376C16.4787 13.3247 13.4738 10.9996 9.93066 10.9996Z" fill="#C6AA57"/></g><defs><clipPath id="a"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>`,
  maghrib: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 18C24 16.4241 23.6896 14.8637 23.0866 13.4078C22.4835 11.9519 21.5996 10.629 20.4853 9.51472C19.371 8.40042 18.0481 7.5165 16.5922 6.91345C15.1363 6.31039 13.5759 6 12 6C10.4241 6 8.86371 6.31039 7.4078 6.91345C5.95189 7.5165 4.62902 8.40042 3.51472 9.51472C2.40041 10.629 1.5165 11.9519 0.913445 13.4078C0.310389 14.8637 0 16.4241 0 18L12 18H24Z" fill="#C6AA57" fill-opacity="0.5"/><path d="M19 18C19 17.0807 18.8189 16.1705 18.4672 15.3212C18.1154 14.4719 17.5998 13.7003 16.9497 13.0503C16.2997 12.4002 15.5281 11.8846 14.6788 11.5328C13.8295 11.1811 12.9193 11 12 11C11.0807 11 10.1705 11.1811 9.32122 11.5328C8.47194 11.8846 7.70026 12.4002 7.05025 13.0503C6.40024 13.7003 5.88463 14.4719 5.53284 15.3212C5.18106 16.1705 5 17.0807 5 18L12 18H19Z" fill="#C6AA57"/></svg>`,
  isha:    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" fill="#C6AA57"/></svg>`,
}

function roundedRect(ctx, x, y, w, h, r) {
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

export async function shareAsImage({ prayers, hijriDate, gregorianDate, city, language }) {
  await document.fonts.load('700 22px Poppins')
  await document.fonts.load('600 15px Poppins')
  await document.fonts.load('400 13px Poppins')

  const logoDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG)
  const logoImg = await loadImage(logoDataUrl).catch(() => null)

  // Pre-load prayer icons
  const iconImgs = {}
  await Promise.all(Object.entries(PRAYER_ICONS).map(async ([key, svg]) => {
    iconImgs[key] = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)).catch(() => null)
  }))

  const SCALE    = 2
  const W        = 540
  const H        = Math.round(W * 4 / 3)   // portrait 3:4
  const HEADER_H = 90
  const FOOTER_H = 110
  const ROW_H    = Math.floor((H - HEADER_H - FOOTER_H) / prayers.length)
  const PAD      = 28

  const canvas = document.createElement('canvas')
  canvas.width  = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  // Background
  ctx.fillStyle = COLORS.dark
  ctx.fillRect(0, 0, W, H)

  // ── Header: dates (left) + district (right) ──
  const headerMid = HEADER_H / 2 + 4

  // Hijri date — top left
  ctx.textAlign = 'left'
  ctx.font = '600 16px Poppins, sans-serif'
  ctx.fillStyle = COLORS.gold
  ctx.fillText(hijriDate, PAD, headerMid - 8)

  // Gregorian date — below hijri
  ctx.font = '400 14px Poppins, sans-serif'
  ctx.fillStyle = COLORS.muted
  ctx.fillText(gregorianDate, PAD, headerMid + 12)

  // District — top right
  ctx.textAlign = 'right'
  ctx.font = '500 14px Poppins, sans-serif'
  ctx.fillStyle = COLORS.muted
  ctx.fillText((city || ''), W - PAD, headerMid + 2)

  // Prayer rows
  const names = PRAYER_NAMES[language] ?? PRAYER_NAMES.en

  prayers.forEach((prayer, i) => {
    const rowY = HEADER_H + i * ROW_H
    const pad  = 28

    roundedRect(ctx, pad, rowY + 4, W - pad * 2, ROW_H - 8, 12)
    ctx.fillStyle = COLORS.green
    ctx.fill()

    const textY = rowY + ROW_H / 2 + 6
    const iconSize = 22
    const iconX = pad + 14
    const iconY = rowY + ROW_H / 2 - iconSize / 2
    const iconImg = iconImgs[prayer.key]
    if (iconImg) ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize)

    ctx.font = '600 15px Poppins, sans-serif'
    ctx.fillStyle = COLORS.white
    ctx.textAlign = 'left'
    ctx.fillText(names[prayer.key] ?? prayer.name, pad + 46, textY)

    ctx.textAlign = 'right'
    ctx.fillText(prayer.timeStr, W - pad - 18, textY)
  })

  // ── Footer: horizontal logo ──
  const footerY = HEADER_H + prayers.length * ROW_H
  const logoSize = 32
  const logoTextGap = 10
  ctx.font = '700 20px Poppins, sans-serif'
  const textW = ctx.measureText('Muezzin').width
  const totalW = logoSize + logoTextGap + textW
  const logoX = W / 2 - totalW / 2
  const logoCenterY = footerY + FOOTER_H / 2

  if (logoImg) ctx.drawImage(logoImg, logoX, logoCenterY - logoSize / 2, logoSize, logoSize * (162 / 160))

  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.white
  ctx.fillText('Muezzin', logoX + logoSize + logoTextGap, logoCenterY + 7)


  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('Failed to generate image')); return }

      const file = new File([blob], 'muezzin-prayer-times.png', { type: 'image/png' })
      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Prayer Times', text: `Prayer times — ${city}` })
        } else {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'muezzin-prayer-times.png'
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
