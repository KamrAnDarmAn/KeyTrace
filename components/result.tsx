import React, { useState } from 'react'
import { Button } from './ui/button'
import WordScreen from './word-screen'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Separator } from './ui/separator'
import { ArrowRightIcon } from 'lucide-react'

type ResultRow = {
    typed: string
    target: string
    correctChars: number
    isExact: boolean
}

const Result = ({
    accuracy,
    wpm,
    correct = 0,
    completed = 0,
    duration,
    mode,
    results = [],
    onRestart,
}: {
    accuracy: number
    wpm: number
    correct?: number
    completed?: number
    duration?: number
    mode?: 'easy' | 'mid' | 'hard'
    results?: ResultRow[]
    onRestart?: () => void
}) => {
    // fallback to internal navigation if no onRestart is provided
    const [start, setStart] = useState(false)

    const handleRestart = () => {
        if (onRestart) onRestart()
        else setStart(true)
    }

    if (start) return <WordScreen />

    return (
        <div className="h-screen w-full flex justify-center items-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">Results</div>
                        <div className="text-sm text-muted-foreground">{mode?.toUpperCase() ?? 'UNKNOWN'}</div>
                    </div>
                </CardHeader>

                <Separator />

                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">WPM</div>
                            <div className="text-2xl font-bold">{wpm}</div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                            <div className="text-2xl font-bold">{accuracy}%</div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">Correct Words</div>
                            <div className="text-2xl font-bold">{correct}</div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">Completed</div>
                            <div className="text-2xl font-bold">{completed}</div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">Duration</div>
                            <div className="text-2xl font-bold">{duration ?? '-'}s</div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded">
                            <div className="text-xs text-muted-foreground">Mode</div>
                            <div className="text-2xl font-bold">{mode ?? '-'}</div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                        <div className="text-sm font-medium mb-2">Review</div>
                        <div className="max-h-40 overflow-auto rounded border border-border p-2 bg-card">
                            {results.length === 0 && <div className="text-sm text-muted-foreground">No words recorded.</div>}
                            {results.map((r, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-1">
                                    <div className={`font-mono ${r.isExact ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {r.typed}
                                    </div>
                                    <div className="text-muted-foreground">{r.target}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex items-center justify-end gap-2">
                    <Button variant="ghost" onClick={() => navigator.clipboard?.writeText(`WPM: ${wpm} • Accuracy: ${accuracy}%`)}>
                        Copy
                    </Button>
                    <Button onClick={handleRestart}>
                        <ArrowRightIcon /> <span className="ml-2">Play Again</span>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Result