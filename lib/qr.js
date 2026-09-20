// A QR code at error-correction level M holds up to 2,331 bytes, so 2,000 bytes
// of payload leaves headroom for the "[n/total] " prefix on each chunk.
export const MAX_QR_BYTES = 2000

// Room for a worst-case "[9999/9999] " prefix.
const PREFIX_RESERVE = 12

const encoder = new TextEncoder()
const byteLength = (s) => encoder.encode(s).length

// Split text into pieces of at most `limit` UTF-8 bytes, without cutting a
// character in half, preferring to break at whitespace.
function splitByBytes(text, limit) {
  const pieces = []
  let rest = text
  while (rest) {
    if (byteLength(rest) <= limit) {
      pieces.push(rest)
      break
    }
    let end = 0
    let bytes = 0
    for (const ch of rest) {
      const b = byteLength(ch)
      if (bytes + b > limit) break
      bytes += b
      end += ch.length
    }
    const lastSpace = rest.lastIndexOf(' ', end)
    if (lastSpace > end * 0.8) end = lastSpace + 1
    pieces.push(rest.slice(0, end))
    rest = rest.slice(end)
  }
  return pieces
}

// Returns the strings to encode. Short transcripts come back as-is; long ones
// are split into chunks that each start with "[n/total] " so they can be
// scanned independently and reassembled in order.
export function chunkForQr(text) {
  if (byteLength(text) <= MAX_QR_BYTES) return [text]
  const pieces = splitByBytes(text, MAX_QR_BYTES - PREFIX_RESERVE)
  return pieces.map((piece, i) => `[${i + 1}/${pieces.length}] ${piece}`)
}
