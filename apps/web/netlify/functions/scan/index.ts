import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import chromium from '@sparticuz/chromium'
import { configureBrowserLaunch, resetBrowserLaunchConfig, scan } from '@a11y-agent-ops/engine'
import type { AccessibilityReport, AiMode, Locale, WcagLevel } from '@a11y-agent-ops/shared'

import { embedScreenshotDataUrls } from './embedScreenshots.js'

type ScanSuccess = { success: true; data: AccessibilityReport }
type ScanFailure = { success: false; error: string }
type ScanResponse = ScanSuccess | ScanFailure

interface ScanRequestBody {
  url?: string
  cliOverrides?: {
    maxPages?: number
    wcagLevel?: WcagLevel
    aiMode?: AiMode
    locale?: Locale
    projectName?: string
  }
}

interface NetlifyEvent {
  httpMethod?: string
  body?: string | null
  isBase64Encoded?: boolean
}

interface NetlifyResult {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
}

/** Netlify sync functions are short-lived — keep crawl small. */
const SERVERLESS_MAX_PAGES = 5

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function json(statusCode: number, payload: ScanResponse): NetlifyResult {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  }
}

function parseBody(event: NetlifyEvent): unknown {
  if (!event.body) {
    return {}
  }
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body
  const trimmed = raw.trim()
  if (!trimmed) {
    return {}
  }
  return JSON.parse(trimmed) as unknown
}

function validateHttpUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error('Missing url')
  }
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Invalid URL')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported')
  }
  return parsed.toString()
}

function parseRequest(value: unknown): ScanRequestBody {
  if (!isRecord(value)) {
    return {}
  }
  const cli = isRecord(value.cliOverrides) ? value.cliOverrides : undefined
  return {
    ...(typeof value.url === 'string' ? { url: value.url } : {}),
    ...(cli
      ? {
          cliOverrides: {
            ...(typeof cli.maxPages === 'number' ? { maxPages: cli.maxPages } : {}),
            ...(typeof cli.wcagLevel === 'string'
              ? { wcagLevel: cli.wcagLevel as WcagLevel }
              : {}),
            ...(typeof cli.aiMode === 'string' ? { aiMode: cli.aiMode as AiMode } : {}),
            ...(typeof cli.locale === 'string' ? { locale: cli.locale as Locale } : {}),
            ...(typeof cli.projectName === 'string' ? { projectName: cli.projectName } : {}),
          },
        }
      : {}),
  }
}

/**
 * Writable output dirs for serverless (Netlify FS is read-only except /tmp).
 */
async function writeTempScanConfig(): Promise<string> {
  const workRoot = await mkdtemp(path.join(tmpdir(), 'a11y-ops-'))
  const reportsDir = path.join(workRoot, 'report')
  const configPath = path.join(workRoot, 'a11y-ops.config.json')
  await writeFile(
    configPath,
    JSON.stringify({
      reportsDir,
      screenshotsDir: path.join(reportsDir, 'screenshots'),
      tasksDir: path.join(reportsDir, 'tasks'),
    }),
  )
  return configPath
}

function shouldUseServerlessChromium(): boolean {
  // @sparticuz/chromium ships a Linux binary only (Netlify/AWS Lambda).
  return process.platform === 'linux'
}

/**
 * Playwright's bundled Chromium is not available in Netlify Functions.
 * Use the stripped serverless binary from `@sparticuz/chromium`.
 */
async function prepareServerlessBrowser(): Promise<void> {
  if (!shouldUseServerlessChromium()) {
    return
  }

  // Prefer less GPU work in Lambda-like runtimes.
  chromium.graphicsMode = false
  configureBrowserLaunch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  })
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResult> {
  const method = event.httpMethod ?? 'GET'

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' }
  }

  if (method !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed' })
  }

  let body: ScanRequestBody
  try {
    body = parseRequest(parseBody(event))
  } catch {
    return json(400, { success: false, error: 'Invalid JSON body' })
  }

  let targetUrl: string
  try {
    targetUrl = validateHttpUrl(body.url ?? '')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid URL'
    return json(400, { success: false, error: message })
  }

  try {
    await prepareServerlessBrowser()

    const requestedPages = body.cliOverrides?.maxPages ?? SERVERLESS_MAX_PAGES
    const maxPages = Math.min(Math.max(1, requestedPages), SERVERLESS_MAX_PAGES)

    const configPath = await writeTempScanConfig()
    const report = await scan({
      url: targetUrl,
      configPath,
      cliOverrides: {
        maxPages,
        aiMode: body.cliOverrides?.aiMode ?? 'off',
        ...(body.cliOverrides?.wcagLevel ? { wcagLevel: body.cliOverrides.wcagLevel } : {}),
        ...(body.cliOverrides?.locale ? { locale: body.cliOverrides.locale } : {}),
        ...(body.cliOverrides?.projectName
          ? { projectName: body.cliOverrides.projectName }
          : {}),
      },
    })

    const data = await embedScreenshotDataUrls(report)
    return json(200, { success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return json(500, { success: false, error: message })
  } finally {
    resetBrowserLaunchConfig()
  }
}
