import { useState } from 'react'
import { jsPDF } from 'jspdf'
import type { GeneratedBrief } from '../types'

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function safeFilename(name: string) {
  return name
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72) || 'brief'
}

type YRef = { y: number }

function writeParagraph(
  pdf: jsPDF,
  text: string,
  opts: {
    maxW: number
    margin: number
    pageHeight: number
    fontSize: number
    lineHeight: number
    fontStyle: 'normal' | 'bold'
    y: YRef
    newPage: () => void
    gray?: boolean
  },
) {
  const {
    maxW,
    margin,
    pageHeight,
    fontSize,
    lineHeight,
    fontStyle,
    y,
    newPage,
    gray,
  } = opts

  pdf.setFont('helvetica', fontStyle)
  pdf.setFontSize(fontSize)
  if (gray) pdf.setTextColor(55, 55, 55)
  else pdf.setTextColor(0, 0, 0)

  const lines = pdf.splitTextToSize(text, maxW)
  for (const line of lines) {
    if (y.y + lineHeight > pageHeight - margin) {
      newPage()
      y.y = margin
    }
    pdf.text(line, margin, y.y)
    y.y += lineHeight
  }
}

function buildBriefPdf(brief: GeneratedBrief): jsPDF {
  const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const margin = 14
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const maxW = pageWidth - margin * 2
  const y: YRef = { y: margin + 6 }

  const newPage = () => {
    pdf.addPage()
    y.y = margin + 6
  }

  writeParagraph(pdf, brief.projectName, {
    maxW,
    margin,
    pageHeight,
    fontSize: 18,
    lineHeight: 7,
    fontStyle: 'bold',
    y,
    newPage,
  })
  y.y += 2

  writeParagraph(pdf, brief.tagline, {
    maxW,
    margin,
    pageHeight,
    fontSize: 11,
    lineHeight: 5.5,
    fontStyle: 'normal',
    y,
    newPage,
  })
  y.y += 1

  writeParagraph(
    pdf,
    `${formatDate(brief.generatedAt)} · signature ${brief.combinationId}`,
    {
      maxW,
      margin,
      pageHeight,
      fontSize: 8.5,
      lineHeight: 4.2,
      fontStyle: 'normal',
      y,
      newPage,
      gray: true,
    },
  )
  pdf.setTextColor(0, 0, 0)
  y.y += 6

  for (const s of brief.sections) {
    writeParagraph(pdf, s.title.toUpperCase(), {
      maxW,
      margin,
      pageHeight,
      fontSize: 9,
      lineHeight: 4.5,
      fontStyle: 'bold',
      y,
      newPage,
    })
    y.y += 1.5

    writeParagraph(pdf, s.body, {
      maxW,
      margin,
      pageHeight,
      fontSize: 10,
      lineHeight: 4.9,
      fontStyle: 'normal',
      y,
      newPage,
    })
    y.y += 4
  }

  return pdf
}

export function BriefOutput({ brief }: { brief: GeneratedBrief }) {
  const [pdfBusy, setPdfBusy] = useState(false)

  const text = brief.sections
    .map((s) => `## ${s.title}\n${s.body}`)
    .join('\n\n')

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(
        `${brief.projectName}\n${brief.tagline}\n\n${text}`,
      )
    } catch {
      // ignore
    }
  }

  function downloadPdf() {
    setPdfBusy(true)
    window.setTimeout(() => {
      try {
        const pdf = buildBriefPdf(brief)
        pdf.save(`BriefForge-${safeFilename(brief.projectName)}.pdf`)
      } finally {
        setPdfBusy(false)
      }
    }, 0)
  }

  return (
    <div
      id="brief-result"
      className="scroll-mt-24 rounded-[2rem] border border-zinc-800 bg-zinc-950 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-500 md:rounded-[2.5rem]"
    >
      <div className="p-8 md:p-12 lg:p-14">
        <div className="flex flex-col items-center gap-8 border-b border-zinc-800 pb-10 md:gap-10 md:pb-12">
          <div className="max-w-3xl lg:max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 md:text-base">
              Generated brief
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              {brief.projectName}
            </h2>
            <p className="mt-3 text-lg text-zinc-300 md:text-xl">{brief.tagline}</p>
            <p className="mt-4 text-base text-zinc-500 md:text-lg">
              {formatDate(brief.generatedAt)} · signature{' '}
              <span className="font-mono text-sm text-zinc-400 md:text-base">
                {brief.combinationId.slice(0, 18)}…
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-semibold text-black shadow-lg shadow-black/40 transition hover:-translate-y-0.5 hover:bg-zinc-200 md:px-10"
            >
              Copy full brief
            </button>
            <button
              type="button"
              disabled={pdfBusy}
              onClick={downloadPdf}
              className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center gap-2 rounded-2xl border border-zinc-600 bg-zinc-900 px-8 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 md:px-10"
            >
              {pdfBusy ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
                  Preparing PDF…
                </>
              ) : (
                <>Download PDF</>
              )}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 text-left md:mt-12 md:grid-cols-2 md:gap-8 lg:gap-10">
          {brief.sections.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-black p-6 transition hover:border-zinc-600 hover:shadow-[0_0_32px_-8px_rgba(255,255,255,0.08)] md:rounded-3xl md:p-7 lg:p-8"
            >
              <h3 className="text-base font-semibold uppercase tracking-wide text-zinc-400 md:text-lg">
                {s.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-zinc-300 md:text-lg">
                {s.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
