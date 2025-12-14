'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'initial-loader-last-shown-v1'
const THIRTY_MINUTES_MS = 30 * 60 * 1000
const DISPLAY_MS = 3000
const FADE_OUT_MS = 500

export default function InitialLoader() {
	const [render, setRender] = useState(false)
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const root = document.documentElement
		const now = Date.now()
		const last = Number(localStorage.getItem(STORAGE_KEY) || 0)
		const shouldShow = root.classList.contains('initial-loader-active') || !last || now - last > THIRTY_MINUTES_MS

		if (!shouldShow) {
			return
		}

		if (!root.classList.contains('initial-loader-active')) {
			root.classList.add('initial-loader-active')
			localStorage.setItem(STORAGE_KEY, String(now))
		}

		setRender(true)
		setVisible(true)

		const hideTimer = window.setTimeout(() => {
			setVisible(false)
			root.classList.remove('initial-loader-active')
		}, DISPLAY_MS)

		const cleanupTimer = window.setTimeout(() => {
			setRender(false)
		}, DISPLAY_MS + FADE_OUT_MS)

		return () => {
			clearTimeout(hideTimer)
			clearTimeout(cleanupTimer)
			root.classList.remove('initial-loader-active')
		}
	}, [])

	if (!render) {
		return null
	}

	return (
		<div className={`initial-loader-layer ${visible ? '' : 'initial-loader-layer--hidden'}`}>
			<div className='initial-loader-avatar'>
				<div className='initial-loader-ring' aria-hidden='true'>
					<svg viewBox='0 0 160 160'>
						<circle cx='80' cy='80' r='60' />
					</svg>
				</div>
				<img src='/images/avatar.png' alt='Loading avatar' />
			</div>
		</div>
	)
}
