'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity } from 'lucide-react'
import DashboardTabs from '@/components/ui/DashboardTabs'
import OverviewTab from '@/components/ui/OverviewTab'
import GoalsTab from '@/components/ui/GoalsTab'
import ProjectsTab from '@/components/ui/ProjectsTab'
import ProfileTab from '@/components/ui/ProfileTab'

export default function Dashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('overview')
    const [heatmap, setHeatmap] = useState([])
    const [repos, setRepos] = useState([])
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/user/me', { credentials: 'include' })
                if (!res.ok) router.push('/')
            } catch { router.push('/') }
        }
        checkAuth()
    }, [router])

    // Fetch core data
    useEffect(() => {
        const fetchCore = async () => {
            try {
                const [heatmapRes, reposRes, userRes, statsRes] = await Promise.all([
                    fetch('https://dev-metrics-cd6k.onrender.com/api/commits/heatmap', { credentials: 'include' }),
                    fetch('https://dev-metrics-cd6k.onrender.com/api/repos/top', { credentials: 'include' }),
                    fetch('https://dev-metrics-cd6k.onrender.com/api/user/me', { credentials: 'include' }),
                    fetch('https://dev-metrics-cd6k.onrender.com/api/stats', { credentials: 'include' }),
                ])

                const [heatmapJson, reposJson, userJson, statsJson] = await Promise.all([
                    heatmapRes.json(), reposRes.json(), userRes.json(), statsRes.json()
                ])

                const chartData = Object.entries(heatmapJson.data || {}).map(([date, count]) => ({ date, count }))
                setHeatmap(chartData)
                setRepos(reposJson || [])
                setUser(userJson)
                setStats(statsJson.data || null)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCore()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#8b949e] text-sm font-mono">Fetching your GitHub data...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0d1117] text-white font-mono">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[#0d1117]/80 backdrop-blur border-b border-[#21262d] px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Activity size={20} className="text-[#58a6ff]" />
                        <span className="font-bold text-lg">Dev Metrics</span>
                    </div>
                    <button onClick={() => router.push('/profile')}
                        className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-3 py-2 rounded-lg text-sm hover:border-[#58a6ff] transition-colors">
                        {user?.avatarUrl && <img src={user.avatarUrl} className="w-5 h-5 rounded-full" alt="" />}
                        <span>{user?.username || 'Profile'}</span>
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-[#8b949e] text-sm mt-1">
                        {user?.username ? `Welcome back, @${user.username}` : 'Your coding analytics'}
                    </p>
                </div>

                {/* Tabs */}
                <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                {activeTab === 'overview' && <OverviewTab heatmap={heatmap} repos={repos} user={user} stats={stats} />}
                {activeTab === 'goals' && <GoalsTab />}
                {activeTab === 'projects' && <ProjectsTab />}
                {activeTab === 'profile' && <ProfileTab user={user} />}
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    )
}