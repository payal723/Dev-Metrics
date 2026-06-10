'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, GitBranch, BarChart2, User } from 'lucide-react'

export default function Profile() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("https://dev-metrics-cd6k.onrender.com/api/user/me", {
                    credentials: 'include'
                })
                if (!res.ok) {
                    router.push('/')
                    return
                }
                const data = await res.json()
                setUser(data)
            } catch {
                router.push('/')
            }
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        await fetch("https://dev-metrics-cd6k.onrender.com/api/auth/logout", {
            credentials: 'include'
        })
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-[#0d1117] text-white px-6 py-10 font-mono">
            
            {/* Navbar */}
            <nav className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <BarChart2 className="text-[#58a6ff]" size={20} />
                    <span className="font-bold text-lg">Dev Metrics</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')}
                        className="text-[#8b949e] text-sm hover:text-white transition-colors">
                        Dashboard
                    </button>
                    <button onClick={handleLogout}
                        className="flex items-center gap-2 bg-[#21262d] border border-[#30363d] px-3 py-2 rounded-lg text-sm hover:border-red-500 hover:text-red-400 transition-colors">
                        <LogOut size={14} />
                        Logout
                    </button>
                </div>
            </nav>

            {user && (
                <>
                    {/* Profile Card */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 mb-6 flex items-center gap-6">
                        <img src={user.avatarUrl} className="w-20 h-20 rounded-full border-2 border-[#58a6ff]" />
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
                            <p className="text-[#8b949e] text-sm">GitHub Connected ✅</p>
                            <a href={`https://github.com/${user.username}`} target="_blank" rel="noreferrer"
                                className="text-[#58a6ff] text-sm mt-2 inline-flex items-center gap-1 hover:underline">
                                <GitBranch size={14} />
                                github.com/{user.username}
                            </a>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                            <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-2">Member Since</p>
                            <p className="text-lg font-bold text-[#58a6ff]">
                                {new Date(user.lastFetched).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                            <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-2">Last Synced</p>
                            <p className="text-lg font-bold text-[#58a6ff]">
                                {new Date(user.lastFetched).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
                            <p className="text-[#8b949e] text-xs uppercase tracking-widest mb-2">GitHub ID</p>
                            <p className="text-lg font-bold text-[#58a6ff]">#{user.githubId}</p>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-[#161b22] border border-red-900 rounded-2xl p-6">
                        <h2 className="text-xs text-red-400 uppercase tracking-widest mb-4">Account</h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm">Disconnect GitHub</p>
                                <p className="text-[#8b949e] text-xs mt-1">Remove your GitHub connection and sign out</p>
                            </div>
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-900 border border-red-700 px-4 py-2 rounded-lg text-sm text-red-300 hover:bg-red-800 transition-colors">
                                <LogOut size={14} />
                                Disconnect
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}