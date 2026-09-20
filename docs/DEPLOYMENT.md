# Transcribe: Deployment Guide

This guide takes you from a blank machine to a local instance and a deployed Vercel app.

## Prerequisites

- **Node.js 20.9 or later.** This is the minimum required by the Next.js version the project uses. Check with `node --version`.
- **npm.** It ships with Node.js.
- **Git.**
- **A free Groq API key.** Create one at https://console.groq.com/keys and keep it to hand.
- **A GitHub account and a Vercel account** (only needed for deployment).

## Clone and Install

```bash
git clone https://github.com/lyvnrin/recording-to-transcript.git
cd recording-to-transcript
npm install
```

## Environment Configuration

Create a file named `.env.local` in the project root with one variable:

```
GROQ_API_KEY=your-key-here
```

Replace `your-key-here` with your Groq API key. The file is already listed in `.gitignore`, so it will not be committed.

## Running Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser and drop in an audio file (.m4a, .mp3, .wav, or .webm). Restart the dev server after any change to `.env.local`.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In the Vercel dashboard, choose **Add New, then Project**, and import the repository. Vercel detects Next.js and needs no build settings. (Alternatively, run `npx vercel deploy` from the project root.)
3. Open **Settings, then Environment Variables**, and add `GROQ_API_KEY` with your Groq key. Enable it for the Production environment.
4. Redeploy if you added the variable after the first deploy. Environment variables apply only to deployments made after they are set. In the dashboard, open **Deployments**, select the latest one, and choose **Redeploy**.
5. Open the deployment URL and test with a short recording.

## Building for Production

```bash
npm run build
```

This verifies that the production build succeeds. To run the built app locally, use `npm start`. Vercel runs the build automatically on every deploy.

## Troubleshooting

**"GROQ_API_KEY is not set on the server" or a Groq 401 error.**
The key is missing or invalid. Check that `.env.local` exists in the project root, that the variable name is exactly `GROQ_API_KEY`, and that the key is correct. Generate a new key at https://console.groq.com/keys if needed. Restart `npm run dev` after editing the file.

**Audio file is too large after compression.**
The browser splits long recordings into chunks that each fit under 4MB, so size alone should not cause a failure. If a file still fails, open the browser developer console and look for errors during decoding or chunk upload. A file the browser cannot decode (a corrupted file, or a codec the browser does not support) is the usual cause.

**Vercel returns a 413 error.**
The request body was too large, which means compression did not run or did not shrink the file. Reload the page and try again. Check the browser console for compression errors, and confirm you are using the deployed version of the app rather than a stale cached copy.

**Works locally but fails in production.**
`GROQ_API_KEY` is probably set in `.env.local` but not in the Vercel dashboard. `.env.local` is not deployed. Add the variable under **Settings, then Environment Variables** and redeploy.

**The first load is slow on Vercel.**
On the free tier, an idle function takes a few seconds to start (a cold start). This is expected and not an error. Later requests are faster.

**Compression fails immediately.**
Transcribe relies on the Web Audio API for decoding and resampling. All current versions of Chrome, Edge, Firefox, and Safari support it. Update your browser or switch to a modern one.
