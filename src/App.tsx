import { useCallback, useEffect, useRef, useState } from 'react'
import { BriefOutput } from './components/BriefOutput'
import {
  BRIEF_TYPES,
  BUSINESS_TYPES,
  type BriefType,
  type BusinessType,
  type GeneratedBrief,
} from './types'
import { generateUniqueBrief } from './brief/generate'

export default function App() {
  const [wizardStep, setWizardStep] = useState<1 | 2>(1)
  const [briefType, setBriefType] = useState<BriefType | null>(null)
  const [businessType, setBusinessType] = useState<BusinessType | null>(null)
  const [brief, setBrief] = useState<GeneratedBrief | null>(null)
  const [busy, setBusy] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current)
    }
  }, [])

  const scrollToResult = useCallback(() => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const runGeneration = useCallback(
    async (bt: BriefType, biz: BusinessType) => {
      setBusy(true)
      setBrief(null)
      await new Promise((r) => setTimeout(r, 420))
      const b = generateUniqueBrief(bt, biz)
      setBrief(b)
      setBusy(false)
      scrollToResult()
    },
    [scrollToResult],
  )

  function selectBriefType(id: BriefType) {
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    setBriefType(id)
    setBusinessType(null)
    setBrief(null)
    transitionTimer.current = setTimeout(() => {
      setWizardStep(2)
      transitionTimer.current = null
    }, 320)
  }

  function goBackToStep1() {
    if (transitionTimer.current) clearTimeout(transitionTimer.current)
    setWizardStep(1)
    setBusinessType(null)
    setBrief(null)
  }

  function restartWizard() {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current)
      transitionTimer.current = null
    }
    setWizardStep(1)
    setBriefType(null)
    setBusinessType(null)
    setBrief(null)
    requestAnimationFrame(() => {
      document
        .getElementById('brief-wizard')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function selectBusinessType(id: BusinessType) {
    if (!briefType || busy) return
    setBusinessType(id)
    await runGeneration(briefType, id)
  }

  const briefTypeLabel = briefType
    ? BRIEF_TYPES.find((t) => t.id === briefType)?.label
    : null

  return (
    <div id="top" className="min-h-dvh bg-black font-sans text-zinc-300">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-12 text-base sm:px-8 md:max-w-6xl md:py-16 lg:max-w-[72rem] lg:px-12 lg:py-20">
        <a
          href="#top"
          className="text-xl font-semibold tracking-tight text-white md:text-2xl"
        >
          BriefForge
        </a>

        <div id="brief-wizard" className="mt-12 w-full scroll-mt-8 md:mt-16">
          <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="flex flex-col items-center gap-4">
              <p className="text-base font-semibold text-white md:text-lg">
                Creative brief
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-zinc-500">
                <span
                  className={`h-2.5 w-12 rounded-full transition-colors duration-500 ${briefType ? 'bg-white' : 'bg-zinc-700'}`}
                />
                <span
                  className={`h-2.5 w-12 rounded-full transition-colors duration-500 ${businessType ? 'bg-white' : 'bg-zinc-700'}`}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-zinc-500 md:text-base">
              {wizardStep === 1
                ? 'Step 1 of 2 — Choose your brief type'
                : 'Step 2 of 2 — Choose a business context'}
            </p>

            <div className="relative mt-8 min-h-[300px] overflow-hidden md:mt-10 md:min-h-[340px] lg:min-h-[360px]">
              <div
                className={`text-center transition-all duration-500 ease-out motion-reduce:transition-none ${
                  wizardStep === 1
                    ? 'relative z-10 translate-x-0 opacity-100'
                    : 'pointer-events-none absolute inset-0 z-0 -translate-x-5 opacity-0'
                }`}
                aria-hidden={wizardStep !== 1}
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Brief type
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-center text-base text-zinc-400 md:text-lg">
                  Pick one lane — you&apos;ll choose the industry next.
                </p>
                <div className="mx-auto mt-6 grid w-full max-w-4xl grid-cols-2 justify-items-stretch gap-3 sm:grid-cols-3 lg:gap-4">
                  {BRIEF_TYPES.map((t) => {
                    const active = briefType === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectBriefType(t.id)}
                        className={`group relative min-h-[100px] overflow-hidden rounded-2xl border px-4 py-4 text-center transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 md:min-h-[108px] md:rounded-3xl md:px-5 md:py-5 ${
                          active
                            ? 'border-zinc-500 bg-zinc-900 shadow-lg shadow-black/50 ring-2 ring-zinc-500'
                            : 'border-zinc-800 bg-black hover:border-zinc-600 hover:bg-zinc-950'
                        }`}
                      >
                        <span className="text-2xl md:text-3xl">{t.icon}</span>
                        <span className="mt-2 block text-base font-semibold text-white md:text-lg">
                          {t.label}
                        </span>
                        <span className="mt-1 block text-xs leading-snug text-zinc-500 md:text-sm">
                          {t.description}
                        </span>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 blur-2xl transition group-hover:opacity-100"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div
                className={`transition-all duration-500 ease-out motion-reduce:transition-none ${
                  wizardStep === 2
                    ? 'relative z-10 translate-x-0 opacity-100'
                    : 'pointer-events-none absolute inset-0 z-0 translate-x-6 opacity-0'
                }`}
                aria-hidden={wizardStep !== 2}
              >
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
                  <div className="max-w-2xl text-center">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
                      Business type
                    </h2>
                    <p className="mt-2 text-base text-zinc-400 md:text-lg">
                      Brief:{' '}
                      <span className="font-medium text-white">{briefTypeLabel}</span>
                      {busy ? (
                        <span className="ml-2 inline-flex items-center gap-2 text-zinc-500">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                          Forging…
                        </span>
                      ) : (
                        <span className="text-zinc-500">
                          {' '}
                          — tap an industry to generate your brief.
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={goBackToStep1}
                    disabled={busy}
                    className="shrink-0 rounded-2xl border border-zinc-700 bg-black px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 md:px-5 md:py-3"
                  >
                    ← Change brief type
                  </button>
                </div>
                <div className="mx-auto mt-6 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                  {BUSINESS_TYPES.map((b) => {
                    const active = businessType === b.id
                    return (
                      <button
                        key={b.id}
                        type="button"
                        aria-pressed={active}
                        disabled={busy || !briefType}
                        onClick={() => selectBusinessType(b.id)}
                        className={`min-h-[96px] rounded-2xl border px-4 py-4 text-center text-base transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 disabled:pointer-events-none disabled:opacity-40 md:min-h-[104px] md:rounded-3xl md:py-5 ${
                          active
                            ? 'border-zinc-500 bg-zinc-900 font-semibold text-white ring-2 ring-zinc-500'
                            : 'border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600 hover:bg-zinc-950'
                        }`}
                      >
                        {b.label}
                        <span className="mt-2 block text-xs font-normal leading-snug text-zinc-500 md:text-sm">
                          {b.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={resultRef}
          className={`w-full scroll-mt-10 transition-opacity duration-500 ${brief ? 'mt-12 opacity-100 md:mt-16' : 'hidden'}`}
          aria-live="polite"
        >
          {brief ? (
            <>
              <BriefOutput brief={brief} />
              <div className="mt-8 flex justify-center md:mt-10">
                <button
                  type="button"
                  onClick={restartWizard}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-950 px-8 py-3.5 text-base font-semibold text-white transition hover:border-zinc-400 hover:bg-zinc-900 md:px-10"
                >
                  Restart
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}
