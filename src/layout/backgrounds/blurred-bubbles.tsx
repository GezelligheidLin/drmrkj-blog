import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import siteContent from '@/config/site-content.json'
import { makeNoise2D, rand } from './utils'

function tint(color: string, factor: number) {
	if (!color) return color
	const hex = color.replace('#', '')
	if (hex.length !== 6) return color
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)
	const clamp = (v: number) => Math.max(0, Math.min(255, v))
	return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`
}

// Convert hex/rgb string to HSL once to make per-frame hue shifts cheap
function rgbToHslTuple(color: string): [number, number, number] | null {
	let r = 0,
		g = 0,
		b = 0
	if (color.startsWith('#') && color.length === 7) {
		r = parseInt(color.slice(1, 3), 16)
		g = parseInt(color.slice(3, 5), 16)
		b = parseInt(color.slice(5, 7), 16)
	} else if (color.startsWith('rgb')) {
		const nums = color.match(/([\d\.]+)/g)?.map(Number) || []
		;[r, g, b] = nums
	} else {
		return null
	}
	r /= 255
	g /= 255
	b /= 255
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0,
		s = 0,
		l = (max + min) / 2
	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
		}
		h /= 6
	}
	return [h * 360, s * 100, l * 100]
}

const hslToRgbString = (h: number, s: number, l: number) => `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`

/**
 * Blurred Floating Circles Background
 * - Circles spawn with blue-noise-ish spacing
 * - Movement = Perlin/Simplex flow field + soft separation
 * - Coverage control: low-occupancy attraction prevents big empty holes
 * - Constrained to bottom band (e.g. 55%–100% height)
 */
export default function BlurredBubblesBackground({
	count = 8,
	colors = siteContent.backgroundColors,
	minRadius = 120,
	maxRadius = 460,
	_bottomBandStart = 0,
	speed = 0.55,
	noiseScale = 0.0007,
	noiseTimeScale = 0.001,
	targetFps = 16,
	debugFps = false,
	startDelayMs = 800,
	regenerateKey = 0,
	colorShiftSeconds = 15,
	radiusPulseSeconds = 18,
	radiusPulseScale = 0.18,
	radiusMin = 120,
	radiusMax = 460,
	colorShiftDegrees = 30
}) {
	const ref = useRef<HTMLCanvasElement>(null)
	const noise = useRef(makeNoise2D())
	const animRef = useRef(0)

	useEffect(() => {
		const canvas = ref.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		let width = (canvas.width = canvas.clientWidth)
		let height = (canvas.height = canvas.clientHeight)

		const DPR = Math.min(2, window.devicePixelRatio || 1)
		canvas.width = Math.floor(width * DPR)
		canvas.height = Math.floor(height * DPR)
		ctx.scale(DPR, DPR)

		const effectiveFps = Math.max(1, targetFps)

		// 1s debounce for resize observer
		let resizeTimer: number | null = null
		const handleResize: ResizeObserverCallback = () => {
			if (!canvas || !ctx) return
			const nextWidth = canvas.clientWidth
			const nextHeight = canvas.clientHeight
			if (nextWidth === width && nextHeight === height) return
			width = nextWidth
			height = nextHeight
			canvas.width = Math.floor(width * DPR)
			canvas.height = Math.floor(height * DPR)
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			ctx.scale(DPR, DPR)
			// Recompute occupancy grid on resize
			allocateGrid()
			draw()
		}
		const onResize: ResizeObserverCallback = (...args) => {
			if (resizeTimer !== null) window.clearTimeout(resizeTimer)
			resizeTimer = window.setTimeout(() => {
				handleResize(...args)
				resizeTimer = null
			}, 1000)
		}
		const ro = new ResizeObserver(onResize)
		ro.observe(canvas)

		// --- Occupancy grid (for coverage guidance) ---
		const gridCell = 100 // px
		let gridCols = 0,
			gridRows = 0,
			grid: Float32Array

		function allocateGrid() {
			gridCols = Math.max(1, Math.ceil(width / gridCell))
			gridRows = Math.max(1, Math.ceil(height / gridCell))
			grid = new Float32Array(gridCols * gridRows)
		}
		function stampOccupancy(x: number, y: number, r: number) {
			// Add a light amount to nearby cells so paths get balanced over time
			const c0 = Math.floor((x - r) / gridCell)
			const c1 = Math.floor((x + r) / gridCell)
			const r0 = Math.floor((y - r) / gridCell)
			const r1 = Math.floor((y + r) / gridCell)
			for (let cy = r0; cy <= r1; cy++) {
				for (let cx = c0; cx <= c1; cx++) {
					if (cx < 0 || cy < 0 || cx >= gridCols || cy >= gridRows) continue
					const idx = cy * gridCols + cx
					grid[idx] += 0.35 // lighter weight to avoid directional bias
				}
			}
		}
		function lowestOccupancyTarget() {
			// Gentle pull toward center with wider oscillation to cover right侧
			const t = performance.now()
			const wobbleX = Math.sin(t * 0.00025) * 0.12 // moderate shift
			const wobbleY = Math.cos(t * 0.00018) * 0.04 // subtle vertical drift
			const tx = width * (0.5 + wobbleX)
			const ty = height * (0.5 + wobbleY)
			return { tx, ty }
		}
		allocateGrid()

		// Poisson-ish initial placement to avoid clusters
		const bubbles: {
			x: number
			y: number
			r: number
			rBase: number
			rAmp: number
			rPeriodFactor: number
			sBase: number
			lBase: number
			hBase: number
			hJitterDeg: number
			hueAmpDeg: number
			huePeriodFactor: number
			color: string
			vx: number
			vy: number
			jitter: number
			blur: number
			angle: number
			aspect: number
			noisePhase: number
			homeX: number
			homeY: number
		}[] = []
		const minDist = Math.max(minRadius * 0.7, 120)
		const maxTries = 5000
		let tries = 0
		while (bubbles.length < count && tries < maxTries) {
			tries++
			const r = rand(minRadius, maxRadius)
			const x = rand(r * 0.6, width - r * 0.6)
			const y = rand(r * 0.6, height - r * 0.6)
			let ok = true
			for (let b of bubbles) {
				const dx = b.x - x
				const dy = b.y - y
				if (Math.hypot(dx, dy) < (b.r + r) * 0.6 || Math.hypot(dx, dy) < minDist) {
					ok = false
					break
				}
			}
			if (ok) {
				const baseColor = colors[bubbles.length % colors.length | 0]
				const tinted = tint(baseColor, rand(0.72, 1.18))
				const hsl = rgbToHslTuple(tinted)
				const hueAmpDeg = rand(colorShiftDegrees * 0.55, colorShiftDegrees * 1.25)
				const huePeriodFactor = rand(0.75, 1.35)
				const hJitterDeg = rand(-35, 35)
				const rBase = r
				const rAmp = r * rand(radiusPulseScale * 0.4, radiusPulseScale * 1.1)
				const rPeriodFactor = rand(0.75, 1.3)

				bubbles.push({
					x,
					y,
					r,
					rBase,
					rAmp,
					rPeriodFactor,
					sBase: hsl ? hsl[1] : 70,
					lBase: hsl ? hsl[2] : 60,
					hBase: hsl ? hsl[0] : 200,
					hJitterDeg,
					hueAmpDeg,
					huePeriodFactor,
					color: tinted,
					vx: rand(-0.2, 0.2),
					vy: rand(-0.2, 0.2),
					jitter: rand(0.7, 1.3),
					blur: rand(60, 120),
					angle: rand(0, Math.PI * 2),
					aspect: rand(0.68, 1.25),
					noisePhase: rand(0, 10000),
					homeX: x,
					homeY: y
				})
			}
		}
		// console.log('[bg] tries:', tries)
		// console.log('[bg] bubbles count:', bubbles.length)

		// --- Animation loop ---
		const FRAME_INTERVAL = 1000 / effectiveFps
		let lastTime = 0
		let accumulatedTime = 0
		let fpsCounter = 0
		let fpsStart = 0

		function updatePhysics(t: number) {
			const { tx, ty } = lowestOccupancyTarget()
			let avgX = 0
			let avgY = 0
			for (const b of bubbles) {
				avgX += b.x
				avgY += b.y
			}
			avgX /= Math.max(1, bubbles.length)
			avgY /= Math.max(1, bubbles.length)
			const balanceX = ((width * 0.5 - avgX) / Math.max(width, 1)) * 0.25
			const balanceY = ((height * 0.5 - avgY) / Math.max(height, 1)) * 0.15

			// Update physics
			for (let i = 0; i < bubbles.length; i++) {
				const b = bubbles[i]

				// 1) Flow field (smooth wandering)
				const n = noise.current(b.x * noiseScale + b.noisePhase, b.y * noiseScale + t * noiseTimeScale + b.noisePhase)
				const angle = n * Math.PI * 2
				const fx = Math.cos(angle) * speed * b.jitter
				const fy = Math.sin(angle) * speed * b.jitter

				// 2) Separation (avoid clumping)
				let sx = 0,
					sy = 0
				for (let j = 0; j < bubbles.length; j++)
					if (j !== i) {
						const o = bubbles[j]
						const dx = b.x - o.x
						const dy = b.y - o.y
						const d2 = dx * dx + dy * dy
						const minD = (b.r + o.r) * 0.65
						if (d2 < minD * minD && d2 > 0.001) {
							const d = Math.sqrt(d2)
							const push = (minD - d) / minD // 0..1
							sx += (dx / d) * push * 1.8
							sy += (dy / d) * push * 1.8
						}
					}

				// 3) Coverage bias (drift toward target)
				const dxT = tx - b.x
				const dyT = ty - b.y
				const dT = Math.hypot(dxT, dyT) + 1e-3
				const cx = (dxT / dT) * 0.015 // mild centering
				const cy = (dyT / dT) * 0.015

				// 4) Home tether (keeps distribution spread)
				const hx = (b.homeX - b.x) * 0.012
				const hy = (b.homeY - b.y) * 0.012

				// Combine forces
				b.vx += fx + sx + cx + balanceX + hx
				b.vy += fy + sy + cy + balanceY + hy

				// Apply damping to prevent velocity accumulation
				const damping = 0.93
				b.vx *= damping
				b.vy *= damping

				// Velocity limits to prevent runaway motion
				const maxVel = 4
				const vel = Math.hypot(b.vx, b.vy)
				if (vel > maxVel) {
					b.vx = (b.vx / vel) * maxVel
					b.vy = (b.vy / vel) * maxVel
				}

				// Integrate
				b.x += b.vx
				b.y += b.vy

				// Edge bounce with damping
				const padX = b.r * 0.6
				const padY = b.r * 0.6
				if (b.x < padX) {
					b.x = padX
					b.vx = Math.abs(b.vx) * 0.85
				}
				if (b.x > width - padX) {
					b.x = width - padX
					b.vx = -Math.abs(b.vx) * 0.85
				}
				if (b.y < padY) {
					b.y = padY
					b.vy = Math.abs(b.vy) * 0.85
				}
				if (b.y > height - padY) {
					b.y = height - padY
					b.vy = -Math.abs(b.vy) * 0.85
				}

				// Occupancy stamp
				stampOccupancy(b.x, b.y, b.r * 0.6)
			}
		}
		function draw() {
			for (const b of bubbles) {
				ctx.save()
				ctx.translate(b.x, b.y)
				ctx.rotate(b.angle)
				ctx.filter = `blur(${b.blur}px)`
				ctx.globalAlpha = 0.55
				ctx.beginPath()
				const t = performance.now()
				// Color animation
				const huePeriodMs = colorShiftSeconds * 1000 * b.huePeriodFactor
				const huePhase = huePeriodMs > 0 ? ((t + b.noisePhase * 1000) / huePeriodMs) % 1 : 0
				const hueShift = Math.sin(huePhase * Math.PI * 2) * b.hueAmpDeg
				const hue = (b.hBase + b.hJitterDeg + hueShift + 360) % 360
				ctx.fillStyle = hslToRgbString(hue, b.sBase, b.lBase)

				// Radius pulsation
				const rPeriodMs = radiusPulseSeconds * 1000 * b.rPeriodFactor
				const rPhase = rPeriodMs > 0 ? ((t + b.noisePhase * 1000) / rPeriodMs) % 1 : 0
				const rPulse = Math.sin(rPhase * Math.PI * 2)
				const rNow = Math.min(radiusMax, Math.max(radiusMin, b.rBase + b.rAmp * rPulse))
				ctx.ellipse(0, 0, rNow * b.aspect, rNow, 0, 0, Math.PI * 2)
				ctx.fill()
				ctx.restore()
			}
		}

		function frame(t: number) {
			if (!ctx) return

			// Rate limiting
			{
				if (document.hidden) {
					animRef.current = requestAnimationFrame(frame)
					return
				}

				// Frame rate limiting
				const deltaTime = lastTime ? t - lastTime : 0
				lastTime = t
				accumulatedTime += deltaTime

				if (accumulatedTime < FRAME_INTERVAL) {
					animRef.current = requestAnimationFrame(frame)
					return
				}

				accumulatedTime = 0
			}

			ctx.clearRect(0, 0, width, height)

			updatePhysics(t)

			draw()

			// FPS measurement (optional)
			if (debugFps) {
				if (fpsStart === 0) fpsStart = t
				fpsCounter++
				if (t - fpsStart >= 1000) {
					// Log measured fps vs target
					// eslint-disable-next-line no-console
					console.log('[blurred-bubbles] fps=', fpsCounter, 'target=', effectiveFps)
					fpsCounter = 0
					fpsStart = t
				}
			}

			animRef.current = requestAnimationFrame(frame)
		}

		if (window.innerWidth < 640) {
			setTimeout(() => {
				animRef.current = requestAnimationFrame(frame)
			}, startDelayMs)
		} else {
			animRef.current = requestAnimationFrame(frame)
		}

		draw()

		return () => {
			cancelAnimationFrame(animRef.current)
			ro.disconnect()
			if (resizeTimer !== null) window.clearTimeout(resizeTimer)
		}
	}, [colors, regenerateKey])

	return (
		<motion.div
			animate={{ opacity: 1 }}
			initial={{ opacity: 0 }}
			transition={{ duration: 1 }}
			className='fixed inset-0 z-0 overflow-hidden'>
			<canvas ref={ref} className='h-full w-full' style={{ display: 'block' }} />
		</motion.div>
	)
}
