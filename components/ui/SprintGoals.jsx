'use client'
import { useState, useEffect } from 'react';
import { Target, Flame, GitBranch, FolderGit, TrendingUp, AlertTriangle, CheckCircle2, Edit2, X, Save, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SprintGoals() {
    const [sprintData, setSprintData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [goalsForm, setGoalsForm] = useState({ targetActiveDays: 5, targetCommits: 15, targetRepos: 2 });

    const fetchSprint = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/sprints/current', {
                credentials: 'include'
            });
            const json = await res.json();
            if (json.success) {
                setSprintData(json.data);
                setGoalsForm({
                    targetActiveDays: json.data.progress.targetActiveDays,
                    targetCommits: json.data.progress.targetCommits,
                    targetRepos: json.data.progress.targetRepos
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprint();
    }, []);

    const updateGoals = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/sprints/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(goalsForm)
            });
            const json = await res.json();
            if (json.success) {
                setEditing(false);
                fetchSprint();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return null;

    if (!sprintData) {
        return (
            <Card className="bg-[#161b22] border-[#30363d] mb-8">
                <CardContent className="pt-6 text-center">
                    <p className="text-[#8b949e] text-sm">Unable to load sprint data</p>
                </CardContent>
            </Card>
        );
    }

    const { progress, healthStatus, paceStatus, overallPercent } = sprintData;
    const allGoalsMet = progress.activeDaysPercent === 100 && progress.commitsPercent === 100 && progress.reposPercent === 100;

    const statusConfig = {
        on_track: { color: 'bg-green-900 text-green-300', icon: <TrendingUp size={12} />, label: 'On Track' },
        at_risk: { color: 'bg-yellow-900 text-yellow-300', icon: <AlertTriangle size={12} />, label: 'At Risk' },
        behind: { color: 'bg-red-900 text-red-300', icon: <AlertTriangle size={12} />, label: 'Behind' }
    };
    const status = statusConfig[healthStatus];

    const paceConfig = {
        ahead: { color: 'text-green-400', label: `Ahead of pace` },
        behind_schedule: { color: 'text-yellow-400', label: `Behind pace` }
    };
    const pace = paceConfig[paceStatus];

    const CircularProgress = ({ percent, size = 56, stroke = 6, color = '#58a6ff' }) => {
        const radius = (size - stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        return (
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} stroke="#21262d" strokeWidth={stroke} fill="none" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    className="transition-all duration-700 ease-out" />
                <text x="50%" y="50%" transform="rotate(90, ${size/2}, ${size/2})" textAnchor="middle" dy=".3em"
                    fill="white" fontSize="13" fontWeight="bold">{percent}%</text>
            </svg>
        );
    };

    return (
        <Card className="bg-[#161b22] border-[#30363d] mb-8">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target size={16} className="text-[#58a6ff]" />
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            Weekly Sprint
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {allGoalsMet && <CheckCircle2 size={16} className="text-green-400" />}
                        <Badge className={status.color}>{status.icon} {status.label}</Badge>
                        <button onClick={() => setEditing(!editing)}
                            className="p-1.5 rounded-lg hover:bg-[#21262d] transition-colors text-[#8b949e]">
                            {editing ? <X size={14} /> : <Edit2 size={14} />}
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Week Info */}
                <div className="flex items-center gap-2 mb-4 text-xs text-[#8b949e]">
                    <Calendar size={12} />
                    <span>{progress.daysLeft} days left this week</span>
                    <span className={`ml-auto ${pace.color} font-medium`}>{pace.label}</span>
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
                                    <input type="number" min={1} max={field.max}
                                        value={goalsForm[field.key]}
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
                        {/* Progress Rings */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            {[
                                { 
                                    label: 'Active Days', 
                                    actual: progress.actualActiveDays, 
                                    target: progress.targetActiveDays, 
                                    percent: progress.activeDaysPercent,
                                    color: progress.activeDaysPercent >= 100 ? '#3fb950' : '#58a6ff',
                                    icon: <Flame size={14} />
                                },
                                { 
                                    label: 'Commits', 
                                    actual: progress.actualCommits, 
                                    target: progress.targetCommits, 
                                    percent: progress.commitsPercent,
                                    color: progress.commitsPercent >= 100 ? '#3fb950' : '#a371f7',
                                    icon: <GitBranch size={14} />
                                },
                                { 
                                    label: 'Repos', 
                                    actual: progress.actualRepos, 
                                    target: progress.targetRepos, 
                                    percent: progress.reposPercent,
                                    color: progress.reposPercent >= 100 ? '#3fb950' : '#f0883e',
                                    icon: <FolderGit size={14} />
                                }
                            ].map(goal => (
                                <div key={goal.label} className="flex flex-col items-center gap-2">
                                    <CircularProgress percent={goal.percent} color={goal.color} />
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 justify-center text-[#8b949e] text-xs mb-0.5">
                                            {goal.icon} {goal.label}
                                        </div>
                                        <p className="text-white text-sm font-bold">
                                            {goal.actual}<span className="text-[#8b949e] font-normal"> / {goal.target}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Overall Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[#8b949e] text-xs">Overall Sprint Progress</span>
                                <span className={`text-sm font-bold ${overallPercent >= 80 ? 'text-green-400' : overallPercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {overallPercent}%
                                </span>
                            </div>
                            <div className="h-2.5 bg-[#21262d] rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${overallPercent >= 80 ? 'bg-green-500' : overallPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${overallPercent}%` }}
                                />
                            </div>
                            {allGoalsMet && (
                                <p className="text-green-400 text-xs text-center mt-2 font-medium">
                                    All goals crushed this week! Keep the momentum going.
                                </p>
                            )}
                        </div>

                        {/* Repos contributed */}
                        {progress.reposContributed.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#21262d]">
                                <p className="text-[#8b949e] text-xs mb-2">Repos contributed to this week:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {progress.reposContributed.map((repo, i) => (
                                        <Badge key={i} className="bg-[#0d1117] text-[#58a6ff] border border-[#30363d] text-xs">
                                            {repo.split('/')[1] || repo}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}