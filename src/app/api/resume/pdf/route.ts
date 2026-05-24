import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { defaultResumeData } from '@/lib/resume/default-resume';
import { buildResumePdfHtml } from '@/lib/resume/pdf';
import type { ResumeData } from '@/lib/resume/types';

export const runtime = 'nodejs';

function getChromeExecutablePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\D Venkata Abhishek\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  return candidates.find((candidate) => {
    try {
      return require('node:fs').existsSync(candidate);
    } catch {
      return false;
    }
  });
}

export async function POST(request: Request) {
  let body: Partial<ResumeData> | null = null;

  try {
    body = (await request.json()) as Partial<ResumeData>;
  } catch {
    body = null;
  }

  const resume = body ?? defaultResumeData;
  const html = buildResumePdfHtml(resume as ResumeData);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: getChromeExecutablePath() ?? undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}
