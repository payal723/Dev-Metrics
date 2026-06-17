'use client'
import { useState, useEffect } from 'react'
import { Target, Flame, GitBranch, FolderGit, TrendingUp, AlertTriangle, CheckCircle2, Edit2, X, Save, Calendar, Focus, GitCompare, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function TargetIcon(props) { return <Target {...props} /> }

const statusConfig = {
    on_track: { color: 'bg-green-900/60 text-green-300', icon: <TrendingUp size={12} />, label: 'On Track' },
    at_risk: { color: 'bg-yellow-900/60 text-yellow-300', icon: <AlertTriangle size={12} />, label: 'At Risk' },
    behind: { color: 'bg-red-900/60 text-red-300', icon: <AlertTriangle size={12} />, label: 'Behind' }
}

const CircularProgress = ({ percent, size = 60, stroke = 5, color = '#58a6ff' }) => {
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference
    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} stroke="#21262d" strokeWidth={stroke} fill="none" />
            <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                className="transition-all duration-700 ease-out" />
            <text x="50%" y="50%" transform={`rotate(90, ${size / 2}, ${size / 2})`} textAnchor="middle" dy=".3em"
                fill="white" fontSize="12" fontWeight="bold">{percent}%</text>
        </svg>
    )
}

export default function GoalsTab() {
    const [sprintData, setSprintData] = useState(null)
    const [focusData, setFocusData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [goalsForm, setGoalsForm] = useState({ targetActiveDays: 5, targetCommits: 15, targetRepos: 2 })

    useEffect(() => {
        fetchSprint()
        fetchFocus()
    }, [])

    const fetchSprint = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/sprints/current', { credentials: 'include' })
            const json = await res.json()
            if (json.success) {
                setSprintData(json.data)
                setGoalsForm({
                    targetActiveDays: json.data.progress.targetActiveDays,
                    targetCommits: json.data.progress.targetCommits,
                    targetRepos: json.data.progress.targetRepos
                })
            }
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const fetchFocus = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/focus', { credentials: 'include' })
            const json = await res.json()
            if (json.success) setFocusData(json.data)
        } catch (err) { console.error(err) }
    }

    const updateGoals = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/sprints/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(goalsForm)
            })
            const json = await res.json()
            if (json.success) { setEditing(false); fetchSprint() }
        } catch (err) { console.error(err) }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const progress = sprintData?.progress
    const allGoalsMet = progress && progress.activeDaysPercent === 100 && progress.commitsPercent === 100 && progress.reposPercent === 100
    const status = sprintData ? statusConfig[sprintData.healthStatus] : null
    const pace = sprintData ? (sprintData.paceStatus === 'ahead' ? { color: 'text-green-400', label: 'Ahead of pace' } : { color: 'text-yellow-400', label: 'Behind pace' }) : null

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Sprint Goals Card */}
            <Card className="bg-[#161b22] border-[#30363d]">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Target size={16} className="text-[#58a6ff]" />
                            <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">Weekly Sprint</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {allGoalsMet && <CheckCircle2 size={16} className="text-green-400" />}
                            {status && <Badge className={status.color}>{status.icon} {status.label}</Badge>}
                            <button onClick={() => setEditing(!editing)} className="p-1.5 rounded-lg hover:bg-[#21262d] transition-colors text-[#8b949e]">
                                {editing ? <X size={14} /> : <Edit2 size={14} />}
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-5 text-xs text-[#8b949e]">
                        <Calendar size={12} />
                        <span>{progress?.daysLeft ?? '-'} days left this week</span>
                        {pace && <span className={`ml-auto ${pace.color} font-medium`}>{pace.label}</span>}
                    </div>

                    {editing ? (
                        <div className="space-y-3 mb-4">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { key: 'targetActiveDays', label: 'Active Days', max: 7 },
                                    { key: 'targetCommits', label: 'Commits', max: 100 },
                                    { key: 'targetRepos', label: 'Repos', max: 10 }
                                ].map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <label className="text-[#8b949e] text-xs">{field.label}</label>
                                        <input type="number" min={1} max={field.max} value={goalsForm[field.key]}
                                            onChange={e => setGoalsForm(p => ({ ...p, [field.key]: parseInt(e.target.value) || 1 }))}
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:border-[#58a6ff] focus:outline-none" />
                                    </div>
                                ))}
                            </div>
                            <button onClick={updateGoals}
                                className="flex items-center gap-2 bg-[#58a6ff] text-[#0d1117] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#79b8ff] transition-colors">
                                <Save size={14} /> Save Goals
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                                {[
                                    { label: 'Active Days', actual: progress?.actualActiveDays ?? 0, target: progress?.targetActiveDays ?? 0, percent: progress?.activeDaysPercent ?? 0, color: (progress?.activeDaysPercent ?? 0) >= 100 ? '#3fb950' : '#58a6ff', icon: <Flame size={14} /> },
                                    { label: 'Commits', actual: progress?.actualCommits ?? 0, target: progress?.targetCommits ?? 0, percent: progress?.commitsPercent ?? 0, color: (progress?.commitsPercent ?? 0) >= 100 ? '#3fb950' : '#a371f7', icon: <GitBranch size={14} /> },
                                    { label: 'Repos', actual: progress?.actualRepos ?? 0, target: progress?.targetRepos ?? 0, percent: progress?.reposPercent ?? 0, color: (progress?.reposPercent ?? 0) >= 100 ? '#3fb950' : '#f0883e', icon: <FolderGit size={14} /> },
                                ].map(goal => (
                                    <div key={goal.label} className="flex flex-col items-center gap-2">
                                        <CircularProgress percent={goal.percent} color={goal.color} />
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 justify-center text-[#8b949e] text-xs mb-0.5">{goal.icon} {goal.label}</div>
                                            <p className="text-white text-sm font-bold">{goal.actual}<span className="text-[#8b949e] font-normal"> / {goal.target}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#8b949e] text-xs">Overall Sprint Progress</span>
                                    <span className={`text-sm font-bold ${(sprintData?.overallPercent ?? 0) >= 80 ? 'text-green-400' : (sprintData?.overallPercent ?? 0) >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {sprintData?.overallPercent ?? 0}%
                                    </span>
                                </div>
                                <div className="h-2.5 bg-[#21262d] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${(sprintData?.overallPercent ?? 0) >= 80 ? 'bg-green-500' : (sprintData?.overallPercent ?? 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${sprintData?.overallPercent ?? 0}%` }} />
                                </div>
                                {allGoalsMet && <p className="text-green-400 text-xs text-center mt-2 font-medium">All goals crushed this week! Keep the momentum going.</p>}
                            </div>

                            {progress?.reposContributed?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[#21262d]">
                                    <p className="text-[#8b949e] text-xs mb-2">Repos contributed to this week:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {progress.reposContributed.map((repo, i) => (
                                            <Badge key={i} className="bg-[#0d1117] text-[#58a6ff] border border-[#30363d] text-xs">{repo.split('/')[1] || repo}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Focus Score — NEW UNIQUE FEATURE */}
            {focusData && (
                <Card className="bg-[#161b22] border-[#30363d]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Focus size={16} className="text-[#a371f7]" />
                                <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">Focus Score</CardTitle>
                            </div>
                            <Badge className={`${focusData.focusScore >= 70 ? 'bg-green-900/60 text-green-300' : focusData.focusScore >= 40 ? 'bg-yellow-900/60 text-yellow-300' : 'bg-red-900/60 text-red-300'} text-xs`}>
                                {focusData.focusScore >= 70 ? 'Focused' : focusData.focusScore >= 40 ? 'Distracted' : 'Chaotic'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 mb-5">
                            <div className="relative">
                                <svg width="80" height="80" className="transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" stroke="#21262d" strokeWidth="6" fill="none" />
                                    <circle cx="40" cy="40" r="34" stroke={focusData.focusScore >= 70 ? '#3fb950' : focusData.focusScore >= 40 ? '#f0883e' : '#f85149'}
                                        strokeWidth="6" fill="none" strokeDasharray={2 * Math.PI * 34}
                                        strokeDashoffset={2 * Math.PI * 34 * (1 - focusData.focusScore / 100)}
                                        strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-white text-lg font-bold">{focusData.focusScore}</span>
                                    <span className="text-[#8b949e] text-[8px]">/ 100</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium mb-1">{focusData.primaryInsight}</p>
                                <p className="text-[#8b949e] text-xs leading-relaxed">{focusData.recommendation}</p>
                            </div>
                        </div>

                        {/* Context Switch Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'Repos Touched', value: focusData.reposTouched, icon: <FolderGit size={12} />, color: 'text-[#58a6ff]' },
                                { label: 'Switches', value: focusData.contextSwitches, icon: <GitCompare size={12} />, color: 'text-[#f0883e]' },
                                { label: 'Avg Focus', value: `${focusData.avgFocusDuration}h`, icon: <TargetIcon size={12} />, color: 'text-[#a371f7]' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-[#0d1117] rounded-lg p-3 text-center border border-[#21262d]">
                                    <div className={`${stat.color} mb-1 flex justify-center`}>{stat.icon}</div>
                                    <p className="text-white font-bold">{stat.value}</p>
                                    <p className="text-[#8b949e] text-[10px]">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Repo focus breakdown */}
                        {focusData.repoFocus?.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[#8b949e] text-xs uppercase tracking-wider">Focus Distribution</p>
                                {focusData.repoFocus.map((repo, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-[#8b949e] text-xs w-24 truncate">{repo.name}</span>
                                        <div className="flex-1 h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#a371f7] rounded-full transition-all" style={{ width: `${repo.percentage}%` }} />
                                        </div>
                                        <span className="text-white text-xs font-medium w-8 text-right">{repo.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}