import mysql, { Pool, RowDataPacket } from 'mysql2/promise'

type DbConfig = {
	host: string
	port: number
	user: string
	password: string
	database: string
}

const TABLE_LIKES_SQL = `
CREATE TABLE IF NOT EXISTS blog_likes (
	slug VARCHAR(191) NOT NULL PRIMARY KEY,
	count INT UNSIGNED NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`

const TABLE_EVENTS_SQL = `
CREATE TABLE IF NOT EXISTS blog_like_events (
	slug VARCHAR(191) NOT NULL,
	ip VARCHAR(64) NOT NULL,
	day DATE NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (slug, ip, day),
	INDEX idx_day (day)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`

const requiredEnv = (key: string): string => {
	const value = process.env[key]
	if (!value) throw new Error(`Missing environment variable: ${key}`)
	return value
}

const resolveConfig = (): DbConfig => ({
	host: process.env.LIKE_DB_HOST || '127.0.0.1',
	port: Number(process.env.LIKE_DB_PORT || 3306),
	user: requiredEnv('LIKE_DB_USER'),
	password: requiredEnv('LIKE_DB_PASSWORD'),
	database: requiredEnv('LIKE_DB_NAME')
})

let pool: Pool | null = null
let ensureTablePromise: Promise<void> | null = null

export type LikeCountRow = RowDataPacket & { count: number }

export const getDbPool = (): Pool => {
	if (pool) return pool

	const config = resolveConfig()
	pool = mysql.createPool({
		...config,
		waitForConnections: true,
		connectionLimit: 5,
		connectTimeout: 10000
	})

	return pool
}

export const ensureLikesTable = async (): Promise<void> => {
	if (ensureTablePromise) return ensureTablePromise

	ensureTablePromise = (async () => {
		const connection = await getDbPool().getConnection()
		try {
			await connection.query(TABLE_LIKES_SQL)
			await connection.query(TABLE_EVENTS_SQL)
		} finally {
			connection.release()
		}
	})()

	ensureTablePromise.catch(() => {
		ensureTablePromise = null
	})

	return ensureTablePromise
}
