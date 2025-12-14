import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'
import InitialLoader from '@/components/initial-loader'

const {
	meta: { title, description },
	theme
} = siteContent

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

const htmlStyle = {
	cursor: 'url(/images/cursor.svg) 2 1, auto',
	'--color-brand': theme.colorBrand,
	'--color-primary': theme.colorPrimary,
	'--color-secondary': theme.colorSecondary,
	'--color-brand-secondary': theme.colorBrandSecondary,
	'--color-bg': theme.colorBg,
	'--color-border': theme.colorBorder,
	'--color-card': theme.colorCard,
	'--color-article': theme.colorArticle
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning style={htmlStyle}>
			<Head />

			<body>
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<script
					dangerouslySetInnerHTML={{
						__html: `
					(function() {
						try {
							var key = 'initial-loader-last-shown-v1';
							var now = Date.now();
							var last = Number(localStorage.getItem(key) || 0);
							if (!last || now - last > 1800000) {
								document.documentElement.classList.add('initial-loader-active');
								localStorage.setItem(key, String(now));
							}
						} catch (e) {
							/* ignore */
						}
					})();
		      `
					}}
				/>

				<InitialLoader />
				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
