'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CONFIG, QUIZ, OPEN_QUESTION } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'
import { useHotspots } from '@/lib/hotspots'
import { judgeSafety, feedbackFor } from '@/lib/jev'

const TOTAL = QUIZ.length + 1;

export default function QuizPage() {
  const { state, ready, dispatch } = useDemoStoreContext();
  const { spots, ready: hsReady } = useHotspots();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [final, setFinal] = useState(0);
  const [result, setResult] = useState(false);
  const [openText, setOpenText] = useState('');
  const [openFeedback, setOpenFeedback] = useState('');
  const [openDone, setOpenDone] = useState(false);
  const [judging, setJudging] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const total = spots.length;
  useEffect(() => { if (ready && hsReady && (!state.learnerName || state.viewedHotspots.length < total)) window.location.replace(state.learnerName ? '/scene' : '/') }, [ready, hsReady, state.learnerName, state.viewedHotspots.length, total]);
  if (!ready || !hsReady || !state.learnerName) return <div className="loading-state">Loading quiz…</div>
  const need = Math.ceil((CONFIG.PASS_MARK_PERCENT / 100) * TOTAL);
  const isOpen = step >= QUIZ.length;

  function checkMcq() {
    if (!selected || checked) return;
    setChecked(true);
    const q = QUIZ[step];
    if (selected === q.answer) setScore((v) => v + 1);
  }

  async function submitOpen() {
    if (!openText.trim() || openDone || judging) return;
    setJudging(true);
    const result = await judgeSafety(openText.trim());
    const fb = feedbackFor(result);
    setOpenFeedback(fb);
    setNeedsReview(result.fallback || result.label !== 'safe');
    if (result.label === 'safe' && !result.fallback) setScore((v) => v + 1);
    setOpenDone(true);
    setJudging(false);
  }

  function next() {
    if (step < TOTAL - 1) { setStep(step + 1); setSelected(''); setChecked(false); return; }
    const finalScore = Math.round((score / TOTAL) * 100);
    dispatch({ lastScore: finalScore, attempts: state.attempts + 1, passed: finalScore >= CONFIG.PASS_MARK_PERCENT });
    if (finalScore >= CONFIG.PASS_MARK_PERCENT) dispatch({ type: 'pass', score: finalScore });
    try {
      fetch('/api/attempts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: state.learnerName, score: finalScore, needsReview }) });
    } catch { /* local store keeps the record */ }
    setFinal(finalScore);
    setResult(true);
  }

  function retry() {
    setStep(0); setSelected(''); setChecked(false); setScore(0); setResult(false);
    setOpenText(''); setOpenFeedback(''); setOpenDone(false); setNeedsReview(false);
  }

  if (result) {
    const passed = state.passed || final >= CONFIG.PASS_MARK_PERCENT;
    return <div className="center-page wrap"><div className={passed ? 'result-card passed' : 'result-card failed'}>{passed ? <Check className="result-icon" /> : <X className="result-icon" />}<p className="eyebrow">Quiz complete</p><h1>{passed ? 'You passed.' : 'Not quite yet.'}</h1><div className="score-big">{final}%</div><p>You scored {score} of {TOTAL}. The pass mark is {CONFIG.PASS_MARK_PERCENT}%. {need} of {TOTAL} answers are needed to pass.</p>{passed ? <Link href="/certificate" className="button primary">View certificate <ArrowRight /></Link> : <div className="result-actions"><button className="button primary" onClick={retry}><RotateCcw /> Try again</button><Link href="/scene" className="text-link">Review the scene</Link></div>}</div></div>
  }

  if (isOpen) {
    return <div className="quiz-page wrap"><Link className="back-link" href="/scene"><ArrowLeft /> Back to scene</Link><div className="quiz-head"><p className="eyebrow">Step 2 of 3 - Final question {TOTAL} of {TOTAL}</p><h1>In your own words</h1><p>{OPEN_QUESTION.prompt}</p></div><div className="question-card"><label htmlFor="open-answer">Your answer, 1 to 2 sentences</label><textarea id="open-answer" value={openText} onChange={(e) => !openDone && setOpenText(e.target.value)} rows={3} maxLength={500} placeholder="Type what you would do..." /><div className="question-actions">{!openDone ? <button className="button primary" disabled={!openText.trim() || judging} onClick={submitOpen}>{judging ? 'Checking…' : 'Submit answer'} <ArrowRight /></button> : <button className="button primary" onClick={next}>See result <ArrowRight /></button>}</div>{openDone && <div className="feedback correct" role="status"><Check /><span>{openFeedback}{needsReview && ' Flagged for manager review.'}</span></div>}</div></div>
  }

  const q = QUIZ[step];
  return <div className="quiz-page wrap"><Link className="back-link" href="/scene"><ArrowLeft /> Back to scene</Link><div className="quiz-head"><p className="eyebrow">Step 2 of 3 - Question {step + 1} of {TOTAL}</p><h1>Check what you know</h1><p>Pass mark: {CONFIG.PASS_MARK_PERCENT}%. You need {need} of {TOTAL} answers.</p></div><div className="question-card"><fieldset><legend>{q.question}</legend><div className="options">{q.options.map((option) => <label key={option} className={selected === option ? 'option selected' : 'option'}><input type="radio" name="answer" value={option} checked={selected === option} onChange={() => !checked && setSelected(option)} /> <span>{option}</span>{checked && option === q.answer && <Check />}{checked && selected === option && option !== q.answer && <X />}</label>)}</div></fieldset>{checked && <div className={selected === q.answer ? 'feedback correct' : 'feedback incorrect'} role="status">{selected === q.answer ? <Check /> : <X />}<span><strong>{selected === q.answer ? 'Correct.' : 'Not correct.'}</strong> {q.reason}</span></div>}<div className="question-actions">{!checked ? <button className="button primary" disabled={!selected} onClick={checkMcq}>Check answer <ArrowRight /></button> : <button className="button primary" onClick={next}>{step === TOTAL - 2 ? 'Last question' : 'Next question'} <ArrowRight /></button>}</div></div></div>
}
