// Run with: node scripts/seed.mjs
// Requires scripts/serviceAccount.json (download from Firebase Console > Project Settings > Service Accounts)

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const serviceAccount = require('./serviceAccount.json')

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

async function seed() {
  const batch = db.batch()

  for (let day = 1; day <= 31; day++) {
    // July 1–31 2026 at 17:00 UTC = 1pm Eastern (EDT)
    const unlockAt = Timestamp.fromDate(new Date(Date.UTC(2026, 6, day, 17, 0, 0)))

    const ref = db.collection('days').doc(String(day))
    batch.set(ref, {
      dayNumber: day,
      title: '',
      status: 'empty',
      contentType: 'message',
      unlockAt,
      openedAt: null,
      completedAt: null,
    })
  }

  await batch.commit()
  console.log('✓ Seeded 31 days for July 2026')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
