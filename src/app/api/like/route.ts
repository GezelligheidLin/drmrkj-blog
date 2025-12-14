import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { RowDataPacket } from 'mysql2/promise'

import { ensureLikesTable, getDbPool, type LikeCountRow } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SLUG_LENGTH = 191
const RATE_LIMIT_STATUS = 429

const respond = (status: number, body: Record<string, unknown>) =>
	NextResponse.json(body, {
		status,
		headers: {
			'Cache-Control': 'no-store'
		}
	})

const parseSlug = (req: NextRequest): { slug?: string; error?: string } => {
	const slug = req.nextUrl.searchParams.get('slug')?.trim()
	if (!slug) return { error: 'Missing slug' }
	if (slug.length > MAX_SLUG_LENGTH) return { error: 'Slug too long' }
	return { slug }
}

const getClientIp = (req: NextRequest): string => {
	const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
	if (forwarded) return forwarded
	const realIp = req.headers.get('x-real-ip')?.trim()
	if (realIp) return realIp
	return 'unknown'
}

export const GET = async (req: NextRequest) => {
	const { slug, error } = parseSlug(req)
	if (!slug) return respond(400, { error })

	try {
		await ensureLikesTable()
		const pool = getDbPool()
		const [rows] = await pool.execute<LikeCountRow[]>('SELECT count FROM blog_likes WHERE slug = ?', [slug])
		const count = rows[0]?.count ?? 0
		return respond(200, { count })
	} catch (err) {
		console.error('Failed to fetch like count', err)
		return respond(500, { error: 'Failed to load like count' })
	}
}

export const POST = async (req: NextRequest) => {
	const { slug, error } = parseSlug(req)
	if (!slug) return respond(400, { error })
	const ip = getClientIp(req)

	try {
		await ensureLikesTable()
		const connection = await getDbPool().getConnection()
		let committed = false
		try {
			// Rate limit: one like per IP per slug per day
			const [limitedRows] = await connection.execute<RowDataPacket[]>(
				'SELECT 1 FROM blog_like_events WHERE slug = ? AND ip = ? AND day = CURDATE() LIMIT 1',
				[slug, ip]
			)
			if (limitedRows.length) {
				const [rows] = await connection.execute<LikeCountRow[]>('SELECT count FROM blog_likes WHERE slug = ?', [slug])
				const count = rows[0]?.count ?? 0
				return respond(RATE_LIMIT_STATUS, { reason: 'rate_limited', count })
			}

			await connection.beginTransaction()
			await connection.execute(
				'INSERT INTO blog_like_events (slug, ip, day) VALUES (?, ?, CURDATE()) ON DUPLICATE KEY UPDATE slug = slug',
				[slug, ip]
			)
			await connection.execute(
				'INSERT INTO blog_likes (slug, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
				[slug]
			)
			const [rows] = await connection.execute<LikeCountRow[]>('SELECT count FROM blog_likes WHERE slug = ?', [slug])
			const count = rows[0]?.count ?? 0
			await connection.commit()
			committed = true
			return respond(200, { count })
		} finally {
			if (!committed) {
				try {
					await connection.rollback()
				} catch {
					// ignore rollback errors
				}
			}
			connection.release()
		}
	} catch (err) {
		console.error('Failed to update like count', err)
		return respond(500, { error: 'Failed to save like' })
	}
}
