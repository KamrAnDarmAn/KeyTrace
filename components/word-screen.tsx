'use client'
import { easyModeWords, midModeWords, hardModeWords } from '@/lib/words'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import Result from './result'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'


const VISIBLE_WORD_COUNT = 50
/*
Improvements:
- support multi-level tests (easy, mid, hard)
- allow selecting test duration (seconds)
- improved controls: Start / Restart and selects
*/
const testTimes = [5, 10, 15, 30, 60]

const wordsCreator = (words: string[]) => {
    const list: string[] = []
    for (let i = 0; i < VISIBLE_WORD_COUNT; i++) {
        const index = Math.floor(Math.random() * words.length)
        list.push(words[index])
    }

    return list;
}

const getListByMode = (mode: 'easy' | 'mid' | 'hard') => {
    switch (mode) {
        case 'mid':
            return midModeWords
        case 'hard':
            return hardModeWords
        default:
            return easyModeWords
    }
}


const WordScreen = () => {
    const [keys, setKeys] = useState<string[]>([])
    const [testSeconds, setTestSeconds] = useState('10')
    const TEST_SECONDS = +testSeconds
    const [mode, setMode] = useState<'easy' | 'mid' | 'hard'>('easy')
    const [currentInput, setCurrentInput] = useState('')
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [started, setStarted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(TEST_SECONDS)
    const [results, setResults] = useState<{ typed: string; target: string; correctChars: number; isExact: boolean }[]>([])
    const [restartToggle, setRestartToggle] = useState(false)



    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const timerRef = useRef<number | null>(null)

    // generate words
    useEffect(() => {
        const list = wordsCreator(getListByMode(mode))
        setKeys(list)
        // reset state when words regen
        setCurrentInput('')
        setCurrentWordIndex(0)
        setStarted(false)
        setTimeLeft(TEST_SECONDS)
        setResults([])
    }, [TEST_SECONDS, restartToggle, mode])

    const wordsContainerRef = useRef<HTMLDivElement | null>(null)

    // focus textarea on mount
    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    // timer (stable: only start/stop by `started`)
    useEffect(() => {
        if (!started) return

        // ensure we don't already have an interval
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        timerRef.current = window.setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    // stop when reaching zero
                    if (timerRef.current) {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                    }
                    setStarted(false)
                    return 0
                }
                return t - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [started])

    // scroll current word into view when it changes
    useEffect(() => {
        const el = wordsContainerRef.current?.querySelector(`[data-word-index="${currentWordIndex}"]`) as HTMLElement | null
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        }
    }, [currentWordIndex])

    // stats
    const totalTypedChars = results.reduce((s, r) => s + r.typed.length, 0) + currentInput.length
    const totalCorrectChars = results.reduce((s, r) => s + r.correctChars, 0) + (() => {
        const target = keys[currentWordIndex] ?? ''
        let correct = 0
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === target[i]) correct++
        }
        return correct
    })()

    const elapsedSeconds = TEST_SECONDS - timeLeft
    const minutes = Math.max(elapsedSeconds / 60, 1 / 60) // avoid div by zero
    const wpm = Math.round((totalCorrectChars / 5) / minutes)
    const accuracy = totalTypedChars > 0 ? Math.round((totalCorrectChars / totalTypedChars) * 100) : 100

    const reset = () => {
        setRestartToggle(t => !t)
        setTimeLeft(TEST_SECONDS)
        setStarted(false)
        setCurrentInput('')
        setResults([])
        textareaRef.current?.focus()
    }



    const submitWord = (typed: string) => {
        const target = keys[currentWordIndex] ?? ''
        let correctChars = 0
        for (let i = 0; i < Math.max(typed.length, target.length); i++) {
            if (typed[i] === target[i]) correctChars++
        }
        const isExact = typed === target
        setResults(prev => [...prev, { typed, target, correctChars, isExact }])

        // advance index; if we've consumed the whole list, generate a new list and reset index
        const nextIndex = currentWordIndex + 1
        if (nextIndex >= keys.length) {
            const newKeys = wordsCreator(getListByMode(mode))
            setKeys(newKeys)
            setCurrentWordIndex(0)
        } else {
            setCurrentWordIndex(nextIndex)
        }

        setCurrentInput('')
    }

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (!started) setStarted(true)

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            // submit
            submitWord(currentInput.trim())
            return
        }

        if (e.key === 'Backspace') {
            // allow default behavior (handled in onChange)
            return
        }
    }

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        // allow only single-line input
        const val = e.target.value.replace(/\n/g, '')
        setCurrentInput(val)
    }

    // when time ends, blur textarea to stop further typing
    useEffect(() => {
        if (timeLeft <= 0) textareaRef.current?.blur()
    }, [timeLeft])

    if (timeLeft <= 0) return (
        <Result
            accuracy={accuracy}
            wpm={wpm}
            correct={results.filter(r => r.isExact).length}
            completed={results.length}
            duration={TEST_SECONDS}
            mode={mode}
            results={results}
            onRestart={() => { reset(); setStarted(true); textareaRef.current?.focus() }}
        />
    )


    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-linear-to-b from-slate-900 to-slate-800">
            <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="whitespace-nowrap">Difficulty</span>
                            <Select value={mode} onValueChange={(v) => {
                                setMode(v as 'easy' | 'mid' | 'hard')
                                setRestartToggle(t => !t)
                                setStarted(false)
                                setTimeLeft(TEST_SECONDS)
                            }}>
                                <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="mid">Middle</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="whitespace-nowrap">Duration</span>
                            <Select value={testSeconds} onValueChange={(v) => {
                                setTestSeconds(v)
                                setTimeLeft(+v)
                                setRestartToggle(t => !t)
                                setStarted(false)
                            }}>
                                <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {testTimes.map((t) => (
                                        <SelectItem key={t} value={String(t)}>{t}s</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={() => { setStarted(true); textareaRef.current?.focus() }} className="ml-2">Start</Button>
                        <Button variant="ghost" onClick={() => { setStarted(false) }}>Stop</Button>
                    </div>

                    {/* Key stats */}
                    <div className="flex items-center gap-4 font-mono text-sm">
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{wpm}</div>
                            <div className="text-xs text-muted-foreground">WPM</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{accuracy}%</div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-semibold">{timeLeft}s</div>
                            <div className="text-xs text-muted-foreground">Time</div>
                        </div>
                    </div>
                </div>

                {/* Card: typing area */}
                <div className="rounded-lg bg-linear-to-br from-slate-800/60 to-slate-900/40 p-5 relative">
                    {/* small progress bar */}
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-200"
                            style={{ width: `${Math.min(100, Math.max(0, Math.round((elapsedSeconds / TEST_SECONDS) * 100)))}%` }}
                        />
                    </div>

                    {/* hidden textarea to capture input */}
                    <textarea
                        ref={textareaRef}
                        value={currentInput}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onClick={() => textareaRef.current?.focus()}
                        className="absolute inset-0 w-full h-full opacity-0 resize-none z-10 caret-transparent outline-none"
                        autoFocus
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        disabled={timeLeft <= 0}
                    />

                    {/* words display */}
                    <div
                        ref={wordsContainerRef}
                        onClick={() => textareaRef.current?.focus()}
                        className="flex flex-wrap gap-3 z-0 h-64 overflow-auto items-start py-2 px-1"
                    >
                        {keys.map((word, i) => {
                            const isCurrent = i === currentWordIndex
                            const isPast = i < currentWordIndex

                            if (isCurrent) {
                                return (
                                    <span
                                        key={i}
                                        data-word-index={i}
                                        className="inline-flex items-center mr-2 font-semibold rounded-md bg-slate-800/50 px-2 py-1 ring-1 ring-slate-700 truncate max-w-48 whitespace-nowrap overflow-hidden"
                                    >
                                        {Array.from(word).map((ch, idx) => {
                                            const typedChar = currentInput[idx]
                                            const isTyped = typeof typedChar !== 'undefined'
                                            const correct = isTyped && typedChar === ch
                                            const wrong = isTyped && typedChar !== ch
                                            const classes = correct ? 'text-emerald-400' : wrong ? 'text-red-400' : 'text-slate-400'
                                            return (
                                                <span key={idx} className={`mx-px text-sm ${classes}`}>
                                                    {ch}
                                                </span>
                                            )
                                        })}
                                        {/* blinking caret */}
                                        <span className="inline-block w-px h-5 bg-current ml-2 -mb-1 animate-pulse" />
                                    </span>
                                )
                            }

                            if (isPast) {
                                const res = results[i]
                                const classes = res?.isExact ? 'text-emerald-400 opacity-90' : 'text-red-400 opacity-90'
                                return (
                                    <span
                                        key={i}
                                        data-word-index={i}
                                        className={`inline-block mr-2 px-2 py-1 rounded text-sm ${classes} bg-slate-900/30 truncate max-w-48 whitespace-nowrap overflow-hidden`}
                                    >
                                        {word}
                                    </span>
                                )
                            }

                            return (
                                <span key={i} data-word-index={i} className="inline-block text-slate-400 opacity-70 mr-2 px-2 py-1 rounded text-sm truncate max-w-48 whitespace-nowrap overflow-hidden">
                                    {word}
                                </span>
                            )
                        })}
                    </div>

                    {/* helper row */}
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <div>Click anywhere to focus • Use space or enter to submit</div>
                        {/* <div>{results.filter(r => r.isExact).length} correct • {results.length} completed</div> */}
                    </div>
                </div>

                {/* footer controls */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button onClick={reset} className="w-32">Restart</Button>
                        <Button variant="ghost" onClick={() => { setStarted(false) }} className="hidden sm:inline">Pause</Button>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <strong className="text-emerald-400">{results.filter(r => r.isExact).length}</strong> correct words • <strong>{results.length}</strong> completed
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordScreen
