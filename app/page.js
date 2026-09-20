'use client'

import { useRef, useState } from 'react'
import { compressAudio } from '../lib/audio'
import styles from './page.module.css'

const ACCEPTED = ['.m4a', '.mp3', '.wav', '.webm']

const LABELS = {
  idle: 'Waiting for a file',
  compressing: 'Compressing…',
  transcribing: 'Transcribing…',
  done: 'Done',
  error: 'Error',
}

function todayStamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function baseName(name) {
  return name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '-') || 'recording'
}

async function transcribeChunk(blob, name) {
  const form = new FormData()
  form.append('file', blob, name)
  const res = await fetch('/api/transcribe', { method: 'POST', body: form })
  let data = {}
  try {
    data = await res.json()
  } catch {}
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data.transcript
}

export default function Home() {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle')
  const [detail, setDetail] = useState('')
  const [fileName, setFileName] = useState('')
  const [transcript, setTranscript] = useState('')
  const [copied, setCopied] = useState(false)

  const busy = status === 'compressing' || status === 'transcribing'

  const fail = (message) => {
    setDetail(message)
    setStatus('error')
  }

  const handleFile = async (file) => {
    if (!file) return
    if (!ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      fail(`Unsupported file type. Use ${ACCEPTED.join(', ')}.`)
      return
    }

    setFileName(file.name)
    setTranscript('')
    setDetail(file.name)

    let chunks
    try {
      setStatus('compressing')
      chunks = await compressAudio(file)
    } catch (err) {
      fail(`Could not decode this audio file: ${err.message || err}`)
      return
    }

    try {
      setStatus('transcribing')
      const parts = []
      for (let i = 0; i < chunks.length; i++) {
        setDetail(
          chunks.length > 1 ? `${file.name} — chunk ${i + 1} of ${chunks.length}` : file.name,
        )
        parts.push(await transcribeChunk(chunks[i], `chunk-${i + 1}.wav`))
      }
      setTranscript(parts.join(' ').trim())
      setDetail(file.name)
      setStatus('done')
    } catch (err) {
      fail(err.message)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!busy) handleFile(e.dataTransfer.files?.[0])
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      fail('Could not copy to clipboard.')
    }
  }

  const download = () => {
    const base = baseName(fileName)
    const blob = new Blob([`# ${base}\n\n${transcript}\n`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${todayStamp()}_${base}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusClass = busy ? styles.busy : styles[status]

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Recording to Transcript</h1>
        <p>Drop an audio file to get a transcript.</p>
      </header>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${busy ? styles.disabled : ''}`}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault()
          if (!busy) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
      >
        <p className={styles.dropTitle}>Drag &amp; drop an audio file here</p>
        <p className={styles.dropHint}>{ACCEPTED.join(', ')}</p>
        <button
          type="button"
          className={styles.btn}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          hidden
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <div className={`${styles.status} ${statusClass || ''}`} role="status" aria-live="polite">
        <span className={styles.dot} />
        <span className={styles.label}>{LABELS[status]}</span>
        {status !== 'idle' && detail && <span className={styles.detail}>{detail}</span>}
      </div>

      {status === 'done' && (
        <section className={styles.transcript}>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={copy}>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button type="button" className={styles.btn} onClick={download}>
              Download as .md
            </button>
          </div>
          <pre className={styles.text}>{transcript || '(No speech detected)'}</pre>
        </section>
      )}
    </main>
  )
}
