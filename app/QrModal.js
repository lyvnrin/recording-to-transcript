'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { chunkForQr } from '../lib/qr'
import styles from './page.module.css'

export default function QrModal({ text, onClose }) {
  const chunks = useMemo(() => chunkForQr(text), [text])
  const [index, setIndex] = useState(0)
  const total = chunks.length

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, total - 1))
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, total])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Transcript QR code"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.qr}>
          <QRCodeSVG value={chunks[index]} size={320} level="M" marginSize={2} />
        </div>

        {total > 1 && (
          <div className={styles.pager}>
            <button
              type="button"
              className={styles.btn}
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            <span className={styles.counter} aria-live="polite">
              {index + 1} of {total}
            </span>
            <button
              type="button"
              className={styles.btn}
              disabled={index === total - 1}
              onClick={() => setIndex(index + 1)}
            >
              Next
            </button>
          </div>
        )}

        <button type="button" className={styles.btn} onClick={onClose} autoFocus>
          Close
        </button>
      </div>
    </div>
  )
}
