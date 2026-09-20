import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'

function fail(message, status) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return fail('GROQ_API_KEY is not set on the server.', 500)
  }

  let incoming
  try {
    incoming = await request.formData()
  } catch {
    return fail('Request must be multipart/form-data.', 400)
  }

  const file = incoming.get('file')
  if (!file || typeof file === 'string') {
    return fail('No audio file provided in the "file" field.', 400)
  }

  const outgoing = new FormData()
  outgoing.append('file', file, file.name || 'audio.wav')
  outgoing.append('model', 'whisper-large-v3')
  outgoing.append('response_format', 'json')

  let res
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outgoing,
    })
  } catch (err) {
    return fail(`Could not reach Groq: ${err.message}`, 502)
  }

  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.error?.message || ''
    } catch {}
    return fail(
      `Groq API error (${res.status})${detail ? `: ${detail}` : ''}`,
      res.status === 429 ? 429 : 502,
    )
  }

  const data = await res.json()
  return NextResponse.json({ transcript: (data.text || '').trim() })
}
