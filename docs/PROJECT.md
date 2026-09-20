# Transcribe: Project Brief

## Problem Statement

Corporate laptops often have restricted environments where installing local tools or downloading files from messaging platforms is not straightforward. Online transcription services raise data-handling concerns when the recordings are internal. That leaves a gap: a simple tool, hosted on Vercel, that an individual can control end to end. The user uploads audio from a restricted browser, gets a transcript back, and downloads it as Markdown.

## What Transcribe Does

Transcribe provides a web UI for dropping in audio files and getting back readable transcripts.

The browser compresses the audio client-side (mono, 16kHz WAV) so the upload fits within Vercel's request limits. The compressed file is sent to a Next.js API route, which forwards it to Groq's Whisper API for transcription. The transcript is displayed in the browser and can be downloaded as a .md file.

## Key Capabilities and Output Formats

**Input**
- Accepts .m4a, .mp3, .wav, and .webm files
- Compresses audio client-side to stay under 4MB

**Output**
- Plain text transcript displayed in the browser
- Copy to clipboard
- Download as a .md file, named with the date and the original filename

## Target Audience

I built Transcribe as a personal productivity tool for transcribing work recordings (meetings, calls, and voice memos) from a restricted corporate environment. It is accessible from any browser.

## Team Context

Built by Lavanya Kamble in 2026 as a personal tool during a summer internship.

## Use Cases

1. **Meeting recordings that cannot be downloaded locally.** A manager shares a Teams meeting recording, and the file cannot be saved to a personal machine. Transcribe turns the audio into text without requiring a local install.
2. **Voice memos to written notes.** A spoken voice memo is converted into written notes, for example as source material for a research paper.
3. **Sharing a transcript in chat.** A Markdown transcript is produced quickly and shared back through Teams chat.
