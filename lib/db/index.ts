
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import * as schema from './schema'

type DbGlobal = typeof globalThis & {
  __dbPool?: Pool
  __db?: ReturnType<typeof drizzle<typeof schema>>
}

const g = globalThis as DbGlobal


function getSupabaseCaCertificate(): string {
  const base64Certificate = process.env.SUPABASE_CA_CERT_B64

  if (base64Certificate?.trim()) {
    const certificate = Buffer
      .from(base64Certificate.trim(), 'base64')
      .toString('utf8')
      .replace(/\r\n/g, '\n')
      .trim()

    const fingerprint = createHash('sha256')
      .update(certificate)
      .digest('hex')

    console.log('Supabase CA diagnostic:', {
      fingerprint,
      length: certificate.length,
      validHeader: certificate.startsWith(
        '-----BEGIN CERTIFICATE-----'
      ),
      validFooter: certificate.endsWith(
        '-----END CERTIFICATE-----'
      ),
    })

    if (
      !certificate.startsWith('-----BEGIN CERTIFICATE-----') ||
      !certificate.endsWith('-----END CERTIFICATE-----')
    ) {
      throw new Error('Invalid SUPABASE_CA_CERT_B64 certificate')
    }

    return certificate
  }

  const envCertificate = process.env.SUPABASE_CA_CERT

  if (envCertificate?.trim()) {
    return envCertificate
      .replace(/\r\n/g, '\n')
      .replace(/\\n/g, '\n')
      .trim()
  }

  const certificatePath = join(
    process.cwd(),
    'supabase-prod-ca.crt'
  )

  try {
    return readFileSync(certificatePath, 'utf8')
  } catch {
    throw new Error(
      'Missing Supabase CA certificate.'
    )
  }
}


export function getDb() {
  if (!g.__db) {
    if (!g.__dbPool) {
      const connectionString = process.env.DATABASE_URL

      if (!connectionString) {
        throw new Error('Missing DATABASE_URL environment variable')
      }

      g.__dbPool = new Pool({
        connectionString,
        ssl: {
          ca: getSupabaseCaCertificate(),
          rejectUnauthorized: true,
        },
        max: process.env.NODE_ENV === 'production' ? 1 : 5,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 10000,
        allowExitOnIdle: process.env.NODE_ENV !== 'production',
      })
    }

    g.__db = drizzle(g.__dbPool, { schema })
  }

  return g.__db
}

export async function closeDb() {
  if (g.__dbPool) {
    await g.__dbPool.end()
    g.__dbPool = undefined
    g.__db = undefined
  }
}
