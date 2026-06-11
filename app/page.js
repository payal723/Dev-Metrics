'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitBranch, BarChart2, Shield } from 'lucide-react'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
    fetch("https://dev-metrics-cd6k.onrender.com/", { mode: 'no-cors' })
}, [])

    return (
        <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
            
            {/* Navbar */}
            <nav className="flex justify-between items-center px-8 py-5 border-b border-[#21262d]">
                <div className="flex items-center gap-2">
                    <BarChart2 className="text-[#58a6ff]" size={22} />
                    <span className="font-bold text-lg tracking-tight">Dev Metrics</span>
                </div>
                <a href="https://dev-metrics-cd6k.onrender.com/api/auth/github"
                    className="bg-[#58a6ff] text-[#0d1117] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#79b8ff] transition-colors">
                    Connect GitHub
                </a>
            </nav>

            {/* Hero */}
            <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">
                <div className="inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-3 py-1 rounded-full text-xs text-[#8b949e] mb-6">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Live GitHub data — no manual input
                </div>

                <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
                    Your GitHub activity,<br />
                    <span className="text-[#58a6ff]">beautifully visualized</span>
                </h1>

                <p className="text-[#8b949e] text-lg max-w-xl mb-10">
                    Connect your GitHub account and instantly see your commit heatmap, top repositories, and coding streaks — all in one dashboard.
                </p>

                <a href="https://dev-metrics-cd6k.onrender.com/api/auth/github"
                    className="flex items-center gap-2 bg-[#58a6ff] text-[#0d1117] px-6 py-3 rounded-xl font-semibold text-base hover:bg-[#79b8ff] transition-colors">
                    <GitBranch size={18} />
                    Connect with GitHub
                </a>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20 max-w-5xl mx-auto w-full">
                {[
                    { icon: <BarChart2 size={20} className="text-[#58a6ff]" />, title: "Commit Heatmap", desc: "See your daily push activity across all repositories" },
                    { icon: <GitBranch size={20} className="text-[#58a6ff]" />, title: "Top Repositories", desc: "Track your most active repos sorted by recent activity" },
                    { icon: <Shield size={20} className="text-[#58a6ff]" />, title: "Secure OAuth", desc: "GitHub OAuth 2.0 — no passwords stored, ever" },
                ].map((f, i) => (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
                        <div className="mb-3">{f.icon}</div>
                        <h3 className="font-semibold mb-1">{f.title}</h3>
                        <p className="text-[#8b949e] text-sm">{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="text-center text-[#8b949e] text-xs pb-6">
                Built by Payal Jat · Full Stack Developer
            </div>
        </div>
    )
}