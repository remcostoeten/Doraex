import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { Providers } from '@/components/providers'
import { MotionLayoutProvider } from '@/lib/motion'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Outerbase Clone',
	description: 'A modern database management interface',
	generator: 'v0.dev'
}

export default async function RootLayout({
	children
}: {
	children: React.ReactNode
}) {
	const session = await getServerSession(authOptions)

	return (
		<html lang='en'>
			<body className={inter.className}>
				<Providers session={session}>
					<MotionLayoutProvider>
						{children}
					</MotionLayoutProvider>
				</Providers>
			</body>
		</html>
	)
}
