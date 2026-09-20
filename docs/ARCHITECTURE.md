# Transcribe: Architecture

## System Overview

Transcribe is a Next.js application deployed on Vercel. The browser handles audio compression through the Web Audio API. A Next.js API route proxies the compressed file to Groq's Whisper API for transcription, and the transcript is returned to the frontend for display and download. Nothing is stored on the server.

## Architecture Diagram

![Transcribe architecture diagram](assets/architecture-diagram.png)

*Figure 1: Audio is compressed in the browser, proxied through a Next.js API route to Groq's Whisper API, and returned as text.*

## Pipeline Stages

1. **File selection.** The user drops or picks an audio file in the browser. The frontend checks the file extension against the accepted list (.m4a, .mp3, .wav, .webm) and rejects anything else.
2. **Compression.** The browser decodes the audio with the Web Audio API (`decodeAudioData`), resamples it to mono 16kHz using an `OfflineAudioContext`, and encodes it as 16-bit PCM WAV. This brings the file well below 4MB for typical recordings. If the result would still exceed 4MB, the samples are split into consecutive chunks that each fit under the limit.
3. **Upload.** The frontend POSTs each compressed WAV to `/api/transcribe` as `multipart/form-data`. Chunks are sent one at a time, in order.
4. **API proxy.** The Next.js route builds a new multipart request and forwards the file to the Groq Whisper API (`whisper-large-v3`), adding the `Authorization` header with the server-side API key.
5. **Response.** Groq returns the transcript; the API route passes it back as JSON. If the audio was chunked, the frontend joins the chunk transcripts in order with a single space.
6. **Export.** The user can copy the transcript to the clipboard or download it as a .md file. The file is named `YYYY-MM-DD_<original-filename>.md` and begins with the original filename as a heading.

## Key Architectural Decisions

**Client-side compression.** Vercel's free tier limits request bodies to 4.5MB. Raw recordings are usually much larger, so the browser shrinks them before upload. Mono 16kHz is also the format Whisper works with internally, so little transcription quality is lost.

**Groq for Whisper.** Groq offers a free tier, responds quickly, and serves the `whisper-large-v3` model, which gives the best transcription quality among the Whisper variants.

**Server-side API route.** Calling Groq directly from the browser would expose the API key to anyone who opens the developer tools. The route keeps the key on the server.

**Next.js.** The frontend and the API route live in one project and deploy to Vercel as a single unit, with no separate backend to run.

**No database.** The tool is stateless and single-user. Audio and transcripts exist only in the browser session, and nothing is persisted.

## Data Flow and Schemas

### Request to `/api/transcribe`

`POST /api/transcribe` with `Content-Type: multipart/form-data`:

```
file: <binary audio/wav, under 4MB>
```

### Response

Success (`200`):

```json
{ "transcript": "..." }
```

Failure (`400`, `429`, `500`, or `502`):

```json
{ "error": "Groq API error (429): ..." }
```

The route returns `400` for a malformed request or a missing file, `500` if `GROQ_API_KEY` is not set, `429` when Groq rate-limits the request, and `502` for other Groq failures or network errors.

### Groq API call

The route sends the following to Groq:

```
POST https://api.groq.com/openai/v1/audio/transcriptions
Authorization: Bearer <GROQ_API_KEY>
Content-Type: multipart/form-data

file: <audio file>
model: whisper-large-v3
response_format: json
```

Groq replies with `{ "text": "..." }`. The route trims the text and returns it as `transcript`.

## External Integrations

The only external service is the Groq Whisper API. The API key is read from the `GROQ_API_KEY` environment variable: set it in `.env.local` for local development and in the Vercel dashboard for production. See [DEPLOYMENT.md](DEPLOYMENT.md) for setup.

## Version Control

Repository layout:

```
app/
  api/transcribe/route.js   API route that proxies to Groq
  page.js                   Frontend: upload, status, transcript, export
  layout.js                 Root layout
  globals.css               Global styles
  page.module.css           Page styles
lib/
  audio.js                  Client-side decoding, resampling, WAV encoding, chunking
docs/                       Project documentation
  assets/                   Images used by the docs
next.config.js              Next.js configuration
```

The project has no `public/` directory, as it serves no static assets. `.env.local` holds the API key for local development and is listed in `.gitignore`, so it is never committed.
