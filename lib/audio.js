export const TARGET_SAMPLE_RATE = 16000
export const MAX_BYTES = 4 * 1024 * 1024
const WAV_HEADER_BYTES = 44
const BYTES_PER_SAMPLE = 2

// Decode any browser-supported audio file and resample to mono 16kHz.
export async function decodeToMono16k(file) {
  const arrayBuffer = await file.arrayBuffer()
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioCtx()
  let decoded
  try {
    decoded = await ctx.decodeAudioData(arrayBuffer)
  } finally {
    ctx.close()
  }

  const length = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE)
  const offline = new OfflineAudioContext(1, length, TARGET_SAMPLE_RATE)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination) // channels are down-mixed to mono
  source.start()
  const rendered = await offline.startRendering()
  return rendered.getChannelData(0)
}

function encodeWav(samples) {
  const dataBytes = samples.length * BYTES_PER_SAMPLE
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + dataBytes)
  const view = new DataView(buffer)
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, TARGET_SAMPLE_RATE, true)
  view.setUint32(28, TARGET_SAMPLE_RATE * BYTES_PER_SAMPLE, true) // byte rate
  view.setUint16(32, BYTES_PER_SAMPLE, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeStr(36, 'data')
  view.setUint32(40, dataBytes, true)

  let offset = WAV_HEADER_BYTES
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

// Compress a file to mono 16kHz WAV. Returns one Blob if it fits under
// MAX_BYTES, otherwise several Blobs that each do.
export async function compressAudio(file) {
  const samples = await decodeToMono16k(file)
  const maxSamplesPerChunk = Math.floor((MAX_BYTES - WAV_HEADER_BYTES) / BYTES_PER_SAMPLE)

  const chunks = []
  for (let start = 0; start < samples.length; start += maxSamplesPerChunk) {
    chunks.push(encodeWav(samples.subarray(start, start + maxSamplesPerChunk)))
  }
  return chunks
}
