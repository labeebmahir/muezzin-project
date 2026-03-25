import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan'

// Approximate coordinates for each ACJU zone
const ZONE_COORDS = {
  '01': { lat: 6.9271, lon: 79.8612 }, // Colombo / Gampaha / Kalutara
  '02': { lat: 7.2906, lon: 80.6337 }, // Kandy
  '03': { lat: 7.4675, lon: 80.6234 }, // Matale
  '04': { lat: 6.9497, lon: 80.7891 }, // Nuwara Eliya
  '05': { lat: 6.0535, lon: 80.2210 }, // Galle / Matara
  '06': { lat: 6.1241, lon: 81.1185 }, // Hambantota
  '07': { lat: 9.6615, lon: 80.0255 }, // Jaffna
  '08': { lat: 9.3803, lon: 80.3770 }, // Kilinochchi / Mullaitivu / Mannar
  '09': { lat: 8.7514, lon: 80.4972 }, // Vavuniya
  '10': { lat: 8.5874, lon: 81.2152 }, // Trincomalee
  '11': { lat: 7.7170, lon: 81.6924 }, // Batticaloa / Ampara
  '12': { lat: 6.9934, lon: 81.0550 }, // Badulla / Monaragala
  '13': { lat: 8.3000, lon: 80.4000 }, // Puttalam / Kurunegala
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_NAMES = {
  fajr: 'Fajr', dhuhr: 'Luhar', asr: 'Asar', maghrib: 'Magrib', isha: 'Isha',
}
const REMINDER_MINUTES = 10
const WINDOW_MINUTES = 5 // check window — run cron every 5 min

export default async function handler(req, res) {
  // Simple auth via secret query param or Authorization header
  const secret = req.query.secret || req.headers['authorization']?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const now = new Date()
  const windowMs = WINDOW_MINUTES * 60 * 1000
  const sent = []

  for (const [zone, coords] of Object.entries(ZONE_COORDS)) {
    const coordinates = new Coordinates(coords.lat, coords.lon)
    const params = CalculationMethod.MoonsightingCommittee()
    const times = new PrayerTimes(coordinates, now, params)

    for (const key of PRAYER_KEYS) {
      const prayerTime = times[key]
      // Fire notification REMINDER_MINUTES before prayer
      const reminderTime = new Date(prayerTime.getTime() - REMINDER_MINUTES * 60_000)

      const diff = reminderTime.getTime() - now.getTime()
      if (diff >= 0 && diff < windowMs) {
        const timeStr = prayerTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        const result = await sendPush(zone, PRAYER_NAMES[key], timeStr)
        sent.push({ zone, prayer: key, name: PRAYER_NAMES[key], result })
      }
    }
  }

  res.json({ ok: true, checked: new Date().toISOString(), sent })
}

async function sendPush(zone, prayerName, timeStr) {
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { en: `${prayerName} in ${REMINDER_MINUTES} min` },
      contents: { en: `${prayerName} prayer is at ${timeStr}.` },
      filters: [
        { field: 'tag', key: 'zone', relation: '=', value: zone },
      ],
      ios_sound: 'default',
      android_sound: 'default',
      url: '/',
    }),
  })
  return res.ok ? 'sent' : 'failed'
}
