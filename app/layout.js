import './globals.css'

export const metadata = {
  title: 'BASED-FLAPPY | Weekly ETH Contest',
  description: 'Competitive Web3 Flappy Bird on Base blockchain. Play, compete, earn ETH.',
  other: {
    'base:app_id': '6a167c313b7a47b352a5e374'
  }
}
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
