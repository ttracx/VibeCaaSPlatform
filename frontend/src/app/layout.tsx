export const metadata = {
  title: 'VibeCaaS',
  description: 'Local VibeCaaS dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 0 }}>{children}</body>
    </html>
  )
}

