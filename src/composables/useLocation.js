import { ref } from 'vue'
import ZONES from '../data/zones.json'

// Build a flat map: lowercase district name → zone id
const DISTRICT_ZONE = {}
for (const z of ZONES) {
  for (const d of z.districts) {
    DISTRICT_ZONE[d.toLowerCase()] = z.zone
  }
}

/** Try to match a Nominatim address object to an ACJU zone. */
export function findZoneForAddress(address) {
  // Nominatim returns county / state_district / suburb for SL districts
  const candidates = [
    address.county,
    address.state_district,
    address.city_district,
  ].filter(Boolean)

  for (const raw of candidates) {
    // Strip " District" suffix and try a match
    const name = raw.replace(/\s+district$/i, '').trim().toLowerCase()
    if (DISTRICT_ZONE[name]) return { zone: DISTRICT_ZONE[name], district: raw.replace(/\s+district$/i, '').trim() }
    // Partial match: check if any district name is contained in raw
    for (const [key, zone] of Object.entries(DISTRICT_ZONE)) {
      if (name.includes(key) || key.includes(name)) {
        const display = key.charAt(0).toUpperCase() + key.slice(1)
        return { zone, district: display }
      }
    }
  }
  return null
}

export function useLocation() {
  const city = ref('Locating...')
  const coords = ref(null)
  const detectedZone = ref(null)    // zone id from GPS
  const detectedDistrict = ref('')  // district name from GPS

  async function getLocation() {
    if (!navigator.geolocation) {
      city.value = 'Unknown'
      coords.value = { lat: 7.0731, lon: 79.8977 }
      return
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          coords.value = { lat: pos.coords.latitude, lon: pos.coords.longitude }
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.value.lat}&lon=${coords.value.lon}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const data = await res.json()
            city.value =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.suburb ||
              'Unknown'

            const match = findZoneForAddress(data.address)
            if (match) {
              detectedZone.value = match.zone
              detectedDistrict.value = match.district
            }
          } catch {
            city.value = 'Unknown'
          }
          resolve()
        },
        () => {
          coords.value = { lat: 7.0731, lon: 79.8977 }
          city.value = 'Wattala'
          resolve()
        },
        { timeout: 10000 }
      )
    })
  }

  return { city, coords, detectedZone, detectedDistrict, getLocation }
}
