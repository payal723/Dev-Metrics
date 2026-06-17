'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    GitBranch, BarChart3, Zap, Shield, ArrowRight, 
    TrendingUp, Users, Target, Sparkles, ChevronRight,
    Twitter, Activity, Flame, Code2
} from 'lucide-react'
import { Badge } from "@/components/ui/badge";


function Github({ size = 20, className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.39-1.25.71-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.71 5.41-5.28 5.69.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
        </svg>
    )
}

function Linkedin({ size = 20, className = '' }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
        </svg>
    )
}

// Animated counter hook
function useCounter(end, duration = 2000) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let startTime = null
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            setCount(Math.floor(progress * end))
            if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    }, [end, duration])
    return count
}

// Floating particle background
function ParticleBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-20 animate-float"
                    style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        background: ['#58a6ff', '#a371f7', '#3fb950', '#f0883e'][i % 4],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 10}s`,
                        animationDuration: `${Math.random() * 20 + 15}s`,
                    }}
                />
            ))}
            {/* Gradient orbs */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#58a6ff]/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#a371f7]/5 rounded-full blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0d1117] rounded-full blur-[100px]" />
        </div>
    )
}

// Feature card component
function FeatureCard({ icon, title, description, delay }) {
    return (
        <div 
            className="group relative bg-[#161b22]/60 backdrop-blur-sm border border-[#21262d] rounded-2xl p-6 hover:border-[#30363d] transition-all duration-500 hover:-translate-y-1 animate-fadeIn"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#58a6ff]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="w-12 h-12 bg-[#0d1117] border border-[#21262d] rounded-xl flex items-center justify-center mb-4 group-hover:border-[#58a6ff]/50 group-hover:shadow-[0_0_20px_rgba(88,166,255,0.15)] transition-all duration-500">
                    {icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// Animated stat
function AnimatedStat({ icon, value, label, suffix = '' }) {
    const count = useCounter(value)
    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-2">{icon}</div>
            <p className="text-3xl md:text-4xl font-bold text-white">{count}{suffix}</p>
            <p className="text-[#8b949e] text-sm mt-1">{label}</p>
        </div>
    )
}

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        fetch("https://dev-metrics-cd6k.onrender.com/", { mode: 'no-cors' })
    }, [])

    const features = [
        { 
            icon: <BarChart3 size={22} className="text-[#58a6ff]" />, 
            title: "Smart Analytics", 
            description: "AI-powered insights that detect your coding patterns, peak hours, and productivity trends automatically."
        },
        { 
            icon: <Target size={22} className="text-[#a371f7]" />, 
            title: "Sprint Goals", 
            description: "Set weekly coding targets and track them against real GitHub data. No manual logging needed."
        },
        { 
            icon: <Zap size={22} className="text-[#f0883e]" />, 
            title: "Focus Score", 
            description: "Discover how context switching between repos kills your productivity. Get focus recommendations."
        },
        { 
            icon: <Activity size={22} className="text-[#3fb950]" />, 
            title: "Project Health", 
            description: "Track PR merge rates, issue resolution speed, and overall repository health in one view."
        },
        { 
            icon: <Users size={22} className="text-[#f85149]" />, 
            title: "Review Backlog", 
            description: "Never lose track of pending PR reviews. See exactly what needs your attention across all repos."
        },
        { 
            icon: <Sparkles size={22} className="text-[#d2a8ff]" />, 
            title: "DevCard", 
            description: "Generate a beautiful shareable profile card from your live GitHub data for Twitter and LinkedIn."
        },
    ]

    return (
        <div className="min-h-screen bg-[#0d1117] text-white overflow-x-hidden">
           
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/70 backdrop-blur-xl border-b border-[#21262d]/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#58a6ff] to-[#a371f7] rounded-lg flex items-center justify-center">
                            <Activity size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Dev Metrics</span>
                    </div>
                    <a href="https://dev-metrics-cd6k.onrender.com/api/auth/github"
                        className="flex items-center gap-2 bg-white text-[#0d1117] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e6edf3] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        <Github size={16} />
                        Connect GitHub
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20">
                <ParticleBackground />
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    {/* Badge */}
                    <div className="animate-fadeIn inline-flex items-center gap-2 bg-[#161b22] border border-[#30363d] px-4 py-2 rounded-full text-sm text-[#8b949e] mb-8">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3fb950]"></span>
                        </span>
                        Live GitHub analytics for serious developers
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fadeIn text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]" style={{ animationDelay: '100ms' }}>
                        Understand your
                        <br />
                        <span className="text-shimmer">coding DNA</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="animate-fadeIn text-[#8b949e] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animationDelay: '200ms' }}>
                        AI-powered insights, sprint goals, focus tracking, and project health — all synced from your real GitHub activity. No manual input. No fake data.
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-fadeIn flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ animationDelay: '300ms' }}>
                        <a href="https://dev-metrics-cd6k.onrender.com/api/auth/github"
                            className="group flex items-center gap-2.5 bg-[#58a6ff] text-[#0d1117] px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#79b8ff] transition-all hover:shadow-[0_0_40px_rgba(88,166,255,0.3)] hover:-translate-y-0.5">
                            <Github size={20} />
                            Connect with GitHub
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a href="#features"
                            className="flex items-center gap-2 text-[#8b949e] hover:text-white px-6 py-4 rounded-xl font-medium text-base transition-colors">
                            See features
                            <ChevronRight size={16} />
                        </a>
                    </div>

                    {/* Preview Card Mockup */}
                    <div className="animate-fadeIn relative max-w-3xl mx-auto" style={{ animationDelay: '500ms' }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#58a6ff]/20 via-[#a371f7]/20 to-[#f0883e]/20 rounded-2xl blur-xl" />
                        <div className="relative bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl">
                            {/* Mock Dashboard Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#f85149]" />
                                    <div className="w-3 h-3 rounded-full bg-[#f0883e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#3fb950]" />
                                </div>
                                <div className="flex items-center gap-4 text-[#484f58] text-xs">
                                    <span>Overview</span>
                                    <span>Goals</span>
                                    <span>Projects</span>
                                    <span>Profile</span>
                                </div>
                            </div>
                            
                            {/* Mock Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: 'Day Streak', val: '12', color: 'text-orange-400' },
                                    { label: 'Commits', val: '247', color: 'text-[#58a6ff]' },
                                    { label: 'Focus Score', val: '87', color: 'text-[#a371f7]' },
                                    { label: 'Reviews', val: '5', color: 'text-[#f85149]' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d]">
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
                                        <p className="text-[#484f58] text-[10px] uppercase tracking-wider mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mock Chart */}
                            <div className="flex items-end gap-1.5 h-24 mb-4">
                                {[40, 65, 30, 80, 55, 90, 45, 70, 35, 85, 50, 75].map((h, i) => (
                                    <div key={i} className="flex-1 bg-[#58a6ff]/30 rounded-t hover:bg-[#58a6ff]/60 transition-colors" style={{ height: `${h}%` }} />
                                ))}
                            </div>

                            {/* Mock Insights */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d] border-l-2 border-l-green-500">
                                    <p className="text-green-400 text-xs font-medium mb-1">Peak Performance</p>
                                    <p className="text-[#484f58] text-[10px]">Tuesday is your superpower day</p>
                                </div>
                                <div className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d] border-l-2 border-l-yellow-500">
                                    <p className="text-yellow-400 text-xs font-medium mb-1">Focus Alert</p>
                                    <p className="text-[#484f58] text-[10px]">Context switching up 23% this week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="relative z-10 border-y border-[#21262d] bg-[#161b22]/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AnimatedStat icon={<Flame size={20} className="text-orange-400" />} value={30} label="Day Max Streak" suffix="+" />
                    <AnimatedStat icon={<Code2 size={20} className="text-[#58a6ff]" />} value={500} label="Commits Analyzed" suffix="+" />
                    <AnimatedStat icon={<TrendingUp size={20} className="text-[#3fb950]" />} value={12} label="AI Insights" suffix="" />
                    <AnimatedStat icon={<Users size={20} className="text-[#a371f7]" />} value={100} label="Developers" suffix="+" />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <Badge className="bg-[#21262d] text-[#58a6ff] border-[#30363d] mb-4">Features</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to<br /><span className="text-[#8b949e]">level up your coding</span></h2>
                        <p className="text-[#8b949e] max-w-xl mx-auto">Tools that actually solve problems — not just pretty charts. Built from real developer pain points.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} delay={i * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Unique Value Props */}
            <section className="relative z-10 py-24 bg-[#0d1117]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                num: '01', 
                                title: 'No vanity metrics', 
                                desc: 'We don\'t show stars and forks. We show focus, consistency, and actionable insights that make you a better developer.' 
                            },
                            { 
                                num: '02', 
                                title: 'Real-time sync', 
                                desc: 'Every metric updates from live GitHub data. Set a sprint goal today, see progress tomorrow. Zero manual entry.' 
                            },
                            { 
                                num: '03', 
                                title: 'Team-aware', 
                                desc: 'Track pending PR reviews, collaboration patterns, and project health — features built for developers who work with others.' 
                            },
                        ].map((item, i) => (
                            <div key={i} className="border-l-2 border-[#30363d] pl-6 hover:border-[#58a6ff] transition-colors duration-500">
                                <span className="text-[#30363d] text-5xl font-bold">{item.num}</span>
                                <h3 className="text-white font-semibold text-lg mt-4 mb-2">{item.title}</h3>
                                <p className="text-[#8b949e] text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-24">
                <div className="absolute inset-0 bg-gradient-to-b from-[#58a6ff]/5 to-transparent" />
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to understand<br />your <span className="text-shimmer">coding DNA</span>?</h2>
                    <p className="text-[#8b949e] text-lg mb-10">Connect your GitHub account and get your personalized developer dashboard in seconds.</p>
                    <a href="https://dev-metrics-cd6k.onrender.com/api/auth/github"
                        className="inline-flex items-center gap-2.5 bg-white text-[#0d1117] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#e6edf3] transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:-translate-y-1">
                        <Github size={22} />
                        Get Started Free
                    </a>
                    <p className="text-[#484f58] text-xs mt-4">No credit card required · OAuth 2.0 secure login</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#21262d] py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#58a6ff]" />
                        <span className="text-[#8b949e] text-sm">Dev Metrics by Payal Jat</span>
                    </div>
                    <div className="flex items-center gap-6 text-[#484f58]">
                        <a href="https://github.com/payal723" className="hover:text-[#8b949e] transition-colors"><Github size={16} /></a>
                        <a href="https://www.linkedin.com/in/payal-jat/" className="hover:text-[#8b949e] transition-colors"><Linkedin size={16} /></a>
                    </div>
                </div>
            </footer>
        </div>
    )
}