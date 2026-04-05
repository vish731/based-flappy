export const metadata = {
  title: 'BASED-FLAPPY | Web3 Flappy Bird Contest',
  description: 'Compete in weekly contests for real ETH prizes on Base blockchain',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
