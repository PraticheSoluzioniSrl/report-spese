import './globals.css'

export const metadata = {
  title: 'Cosimo - Gestionale spese',
  description: 'Dashboard finanziaria familiare'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='it'>
      <body>{children}</body>
    </html>
  )
}

