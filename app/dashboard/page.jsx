'use client'
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation'
import { User, GitBranch, Flame, Trophy, Clock, Activity, Star, Code2, AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import SprintGoals from '@/components/ui/SprintGoals'

export default function Dashboard() {
    const router = useRouter()
    const [heatmap, setHeatmap] = useState([]);
    const [repos, setRepos] = useState([]);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [quality, setQuality] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("https://dev-metrics-cd6k.onrender.com/api/user/me", { credentials: 'include' })
                if (!res.ok) router.push('/')
            } catch { router.push('/') }
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [heatmapRes, reposRes, userRes, statsRes, qualityRes] = await Promise.all([
                    fetch("https://dev-metrics-cd6k.onrender.com/api/commits/heatmap", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/repos/top", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/user/me", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/stats", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/quality", { credentials: 'include' }),
                ]);
                const heatmapJson = await heatmapRes.json();
                const reposJson = await reposRes.json();
                const userJson = await userRes.json();
                const statsJson = await statsRes.json();
                const qualityJson = await qualityRes.json();

                const chartData = Object.entries(heatmapJson.data).map(([date, count]) => ({ date, count }));
                setHeatmap(chartData);
                setRepos(reposJson);
                setUser(userJson);
                setStats(statsJson.data);
                setQuality(qualityJson.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const totalPushes = heatmap.reduce((sum, d) => sum + d.count, 0);

    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#8b949e] text-sm font-mono">Fetching your GitHub data...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0d1117] text-white font-mono">
            
            {/* Navbar */}
            <nav className="sticky top-0 z-10 bg-[#0d1117]/80 backdrop-blur border-b border-[#21262d] px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity size={20} className="text-[#58a6ff]" />
                        <span className="font-bold text-lg">Dev Metrics</span>
                    </div>
                    <button onClick={() => router.push('/profile')}
                        className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-3 py-2 rounded-lg text-sm hover:border-[#58a6ff] transition-colors">
                        {user && <img src={user.avatarUrl} className="w-5 h-5 rounded-full" />}
                        <span>{user?.username}</span>
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Hero Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-[#161b22] border-[#30363d] col-span-2 md:col-span-1">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame size={16} className="text-orange-400" />
                                <span className="text-[#8b949e] text-xs uppercase tracking-widest">Current Streak</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-400">{stats?.currentStreak ?? 0}</p>
                            <p className="text-[#8b949e] text-xs mt-1">days in a row</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#161b22] border-[#30363d]">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy size={16} className="text-yellow-400" />
                                <span className="text-[#8b949e] text-xs uppercase tracking-widest">Best Streak</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-400">{stats?.longestStreak ?? 0}</p>
                            <p className="text-[#8b949e] text-xs mt-1">days ever</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#161b22] border-[#30363d]">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <GitBranch size={16} className="text-[#58a6ff]" />
                                <span className="text-[#8b949e] text-xs uppercase tracking-widest">Total Pushes</span>
                            </div>
                            <p className="text-3xl font-bold text-[#58a6ff]">{totalPushes}</p>
                            <p className="text-[#8b949e] text-xs mt-1">last 30 days</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#161b22] border-[#30363d]">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={16} className="text-purple-400" />
                                <span className="text-[#8b949e] text-xs uppercase tracking-widest">Peak Time</span>
                            </div>
                            <p className="text-xl font-bold text-purple-400">{stats?.mostActiveTime ?? '-'}</p>
                            <p className="text-[#8b949e] text-xs mt-1">{stats?.mostActiveDay ?? '-'}</p>
                        </CardContent>
                    </Card>
                </div>

                <SprintGoals />


                {/* Productivity Score */}
                {stats && (
                    <Card className="bg-[#161b22] border-[#30363d] mb-8">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                                Productivity Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-3">
                                <p className="text-4xl font-bold text-green-400">{stats.productivityScore}</p>
                                <p className="text-[#8b949e] text-sm">/ 100</p>
                                <Badge className={`ml-auto ${stats.productivityScore >= 70 ? 'bg-green-900 text-green-300' : stats.productivityScore >= 40 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                                    {stats.productivityScore >= 70 ? '🔥 High' : stats.productivityScore >= 40 ? '⚡ Medium' : '📈 Growing'}
                                </Badge>
                            </div>
                            <Progress value={stats.productivityScore} className="h-2 bg-[#21262d]" />
                            <p className="text-[#8b949e] text-xs mt-2">Based on streak consistency, push frequency, and active days</p>
                        </CardContent>
                    </Card>
                )}

                {/* Commit Chart */}
                <Card className="bg-[#161b22] border-[#30363d] mb-8">
                    <CardHeader>
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            Commit Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={heatmap} barCategoryGap="30%">
                                <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} />
                                <Tooltip cursor={{ fill: '#21262d' }}
                                    contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="count" fill="#58a6ff" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                    {/* Top Repos */}
                    <Card className="bg-[#161b22] border-[#30363d]">
                        <CardHeader>
                            <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                                Top Repositories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                {repos.map((repo, i) => (
                                    <a key={i} href={repo.url} target="_blank" rel="noreferrer"
                                        className="flex justify-between items-center px-3 py-2 bg-[#0d1117] rounded-lg border border-[#21262d] hover:border-[#58a6ff] transition-colors no-underline">
                                        <div className="flex items-center gap-2">
                                            <Code2 size={14} className="text-[#58a6ff] flex-shrink-0" />
                                            <div>
                                                <p className="text-[#58a6ff] font-semibold text-sm">{repo.name}</p>
                                                <p className="text-[#8b949e] text-xs">{repo.language || 'Unknown'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star size={12} className="text-yellow-400" />
                                            <span className="text-xs text-yellow-400">{repo.stars}</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Commit Quality */}
                    {quality && (
                        <Card className="bg-[#161b22] border-[#30363d]">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                                        Commit Health
                                    </CardTitle>
                                    <Badge className={quality.qualityScore >= 60 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}>
                                        {quality.qualityScore}/100
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-[#0d1117] rounded-lg p-3 text-center border border-[#21262d]">
                                        <p className="text-green-400 font-bold text-lg">{quality.goodCount}</p>
                                        <p className="text-[#8b949e] text-xs mt-1">Descriptive</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-lg p-3 text-center border border-[#21262d]">
                                        <p className="text-red-400 font-bold text-lg">{quality.vagueCount}</p>
                                        <p className="text-[#8b949e] text-xs mt-1">Vague</p>
                                    </div>
                                    <div className="bg-[#0d1117] rounded-lg p-3 text-center border border-[#21262d]">
                                        <p className="text-yellow-400 font-bold text-lg">{quality.avgMessageLength}</p>
                                        <p className="text-[#8b949e] text-xs mt-1">Avg chars</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {quality.recentMessages.slice(0, 5).map((msg, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] rounded-lg border border-[#21262d]">
                                            {msg.type === 'good' ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" /> :
                                             msg.type === 'vague' ? <AlertCircle size={14} className="text-red-400 flex-shrink-0" /> :
                                             <MinusCircle size={14} className="text-yellow-400 flex-shrink-0" />}
                                            <span className="text-xs text-[#e6edf3] truncate">{msg.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}