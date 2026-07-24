import { readFile } from 'node:fs/promises'

import type { AccessibilityReport, TaskIssue } from '@a11y-agent-ops/shared'

/**
 * Browser cannot load filesystem paths — replace screenshot files with data URLs.
 */
export async function embedScreenshotDataUrls(
  report: AccessibilityReport,
): Promise<AccessibilityReport> {
  if (!report.issues?.length) {
    return report
  }

  const issues: TaskIssue[] = await Promise.all(
    report.issues.map(async (issue) => {
      const nextPath = await toDataUrlIfFile(issue.screenshotPath)
      if (nextPath === issue.screenshotPath) {
        return issue
      }
      return { ...issue, screenshotPath: nextPath }
    }),
  )

  return { ...report, issues }
}

async function toDataUrlIfFile(screenshotPath: string | null): Promise<string | null> {
  if (!screenshotPath) {
    return null
  }
  if (screenshotPath.startsWith('data:')) {
    return screenshotPath
  }
  if (/^https?:\/\//i.test(screenshotPath)) {
    return screenshotPath
  }

  try {
    const buffer = await readFile(screenshotPath)
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}
