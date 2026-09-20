import './globals.css'

export const metadata = {
  title: 'Recording to Transcript',
  description: 'Personal audio transcription tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
