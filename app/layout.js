import './globals.css'

export const metadata = {
  title: 'BASED-FLAPPY | Weekly ETH Contest',
  description: 'Competitive Web3 Flappy Bird on Base blockchain. Play, compete, earn ETH.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
