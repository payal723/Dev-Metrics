'use client'
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'

export default function Dashboard() {
    const router = useRouter()
    const [heatmap, setHeatmap] = useState([]);
    const [repos, setRepos] = useState([]);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);

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
                const [heatmapRes, reposRes, userRes, statsRes] = await Promise.all([
                    fetch("https://dev-metrics-cd6k.onrender.com/api/commits/heatmap", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/repos/top", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/user/me", { credentials: 'include' }),
                    fetch("https://dev-metrics-cd6k.onrender.com/api/stats", { credentials: 'include' }),
                ]);
                const heatmapJson = await heatmapRes.json();
                const reposJson = await reposRes.json();
                const userJson = await userRes.json();
                const statsJson = await statsRes.json();

                const chartData = Object.entries(heatmapJson.data).map(([date, count]) => ({ date, count }));
                setHeatmap(chartData);
                setRepos(reposJson);
                setUser(userJson);
                setStats(statsJson.data);
            } catch (err) { console.error(err); }
        };
        fetchAll();
    }, []);

    const totalPushes = heatmap.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="min-h-screen bg-[#0d1117] text-white px-6 py-10 font-mono">

            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-[#58a6ff] tracking-tight">Dev Metrics</h1>
                    <p className="text-[#8b949e] text-sm mt-1">Your GitHub activity — live & real</p>
                </div>
                <button onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-3 py-2 rounded-lg text-sm hover:border-[#58a6ff] transition-colors">
                    <User size={14} className="text-[#58a6ff]" />
                    Profile
                </button>
            </div>

            {/* Profile + Total Pushes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 flex items-center gap-4 col-span-2">
                    {user && <>
                        <img src={user.avatarUrl} className="w-14 h-14 rounded-full border-2 border-[#58a6ff]" />
                        <div>
                            <p className="text-lg font-bold">{user.username}</p>
                            <p className="text-[#8b949e] text-sm">GitHub Connected ✅</p>
                        </div>
                    </>}
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 flex flex-col justify-center">
                    <p className="text-4xl font-bold text-[#58a6ff]">{totalPushes}</p>
                    <p className="text-[#8b949e] text-xs mt-1 uppercase tracking-widest">Total Pushes</p>
                </div>
            </div>

            {/* Productivity Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Productivity Score', value: `${stats.productivityScore}/100`, color: 'text-green-400' },
                        { label: 'Current Streak', value: `${stats.currentStreak} days`, color: 'text-[#58a6ff]' },
                        { label: 'Longest Streak', value: `${stats.longestStreak} days`, color: 'text-purple-400' },
                        { label: 'Most Active', value: `${stats.mostActiveDay} ${stats.mostActiveTime}`, color: 'text-yellow-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                            <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Commit Chart */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 mb-6">
                <h2 className="text-xs text-[#8b949e] uppercase tracking-widest mb-5">Commit Activity</h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={heatmap} barCategoryGap="30%">
                        <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} />
                        <Tooltip cursor={{ fill: '#21262d' }}
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#58a6ff" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Repos */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                <h2 className="text-xs text-[#8b949e] uppercase tracking-widest mb-5">Top Repositories</h2>
                <div className="flex flex-col gap-3">
                    {repos.map((repo, i) => (
                        <a key={i} href={repo.url} target="_blank" rel="noreferrer"
                            className="flex justify-between items-center px-4 py-3 bg-[#0d1117] rounded-xl border border-[#21262d] hover:border-[#58a6ff] transition-colors duration-200 no-underline">
                            <div>
                                <p className="text-[#58a6ff] font-semibold text-sm">{repo.name}</p>
                                <p className="text-[#8b949e] text-xs mt-0.5">{repo.language || 'Unknown'}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#8b949e] bg-[#161b22] px-2 py-1 rounded-full border border-[#30363d]">
                                    {repo.pushedAt?.slice(0, 10)}
                                </span>
                                <span className="text-xs text-[#e3b341]">⭐ {repo.stars}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}