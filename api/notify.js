import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ZONES        = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']
const PRAYER_KEYS  = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_NAMES = { fajr: 'Fajr', dhuhr: 'Luhar', asr: 'Asar', maghrib: 'Magrib', isha: 'Isha' }
const REMINDER_MINUTES = 10
const TZ               = 'Asia/Colombo' // UTC+5:30

function slDateStr(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d)
}

function normalise(row) {
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    const key = k.toLowerCase().trim()
    const canon = key === 'luhar' ? 'dhuhr' : key === 'magrib' ? 'maghrib' : key
    out[canon] = v
  }
  return out
}

function loadZoneRows(zone) {
  const path = join(__dirname, '..', 'src', 'data', `zone-${zone}.json`)
  const raw = JSON.parse(readFileSync(path, 'utf-8'))
  const arr = Array.isArray(raw) ? raw : (raw.times ?? [])
  return arr.map(normalise)
}

function parseTime(str, refDate) {
  if (!str) return null
  const s = str.trim()
  let h, min
  const m12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (m12) {
    h = parseInt(m12[1]); min = parseInt(m12[2])
    const isPM = m12[3].toUpperCase() === 'PM'
    if (isPM && h !== 12) h += 12
    if (!isPM && h === 12) h = 0
  } else {
    const m24 = s.match(/^(\d{1,2}):(\d{2})$/)
    if (!m24) return null
    h = parseInt(m24[1]); min = parseInt(m24[2])
  }
  const dateStr = slDateStr(refDate)
  return new Date(`${dateStr}T${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:00+05:30`)
}

export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['authorization']?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const now   = new Date()
  const today = slDateStr(now)
  const scheduled = []
  const errors    = []

  for (const zone of ZONES) {
    const rows  = loadZoneRows(zone)
    const entry = rows.find(r => r.date === today)
    if (!entry) continue

    for (const key of PRAYER_KEYS) {
      const prayerTime = parseTime(entry[key], now)
      if (!prayerTime) continue

      const reminderTime = new Date(prayerTime.getTime() - REMINDER_MINUTES * 60_000)

      // Skip prayers whose reminder has already passed
      if (reminderTime <= now) continue

      const timeStr = prayerTime.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ,
      })

      const result = await sendPush(zone, PRAYER_NAMES[key], timeStr, reminderTime)
      if (result === 'scheduled') {
        scheduled.push({ zone, prayer: key })
      } else {
        errors.push({ zone, prayer: key, result })
      }
    }
  }

  res.json({ ok: true, at: now.toISOString(), today, scheduled: scheduled.length, errors })
}

async function sendPush(zone, prayerName, timeStr, sendAt) {
  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id:   process.env.ONESIGNAL_APP_ID,
        headings: { en: `${prayerName} in ${REMINDER_MINUTES} min` },
        contents: { en: `${prayerName} prayer is at ${timeStr}.` },
        filters:  [{ field: 'tag', key: 'zone', relation: '=', value: zone }],
        send_after: sendAt.toISOString(),
        ios_sound:     'default',
        android_sound: 'default',
        url: '/',
      }),
    })
    const body = await res.json()
    return res.ok ? 'scheduled' : (body.errors?.[0] ?? 'failed')
  } catch (e) {
    return e.message
  }
}
