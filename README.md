# Transcribe

A personal audio transcription tool that compresses recordings in-browser and transcribes them via Groq's Whisper API, outputting clean Markdown transcripts.

I built this to turn my own voice memos and meeting recordings into text without running any servers or paying for a dedicated transcription service.

## Features

- Drag-and-drop audio upload (.m4a, .mp3, .wav, .webm)
- Client-side audio compression to stay within Vercel's request limits
- Transcription via Groq Whisper API (whisper-large-v3)
- Clean transcript output with copy-to-clipboard and download-as-.md (named with the date and original filename)
- Minimal, dark-themed UI
- Deployable to Vercel with zero infrastructure

## Tech Stack

- Next.js (JavaScript)
- Groq Whisper API (whisper-large-v3)
- Web Audio API (client-side compression)
- Vercel (hosting)

## Getting Started

See [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

- [PROJECT.md](docs/PROJECT.md)
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT. See [LICENSE](LICENSE).
