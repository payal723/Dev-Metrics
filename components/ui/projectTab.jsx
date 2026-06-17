'use client'
import { useState, useEffect, useRef } from 'react'
import { Share2, GitHub, GitBranch, Flame, Calendar, Code2, Users, FolderGit, Copy, Check, Download, ExternalLink, MapPin, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const langColors = {
    JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5', Java: '#b07219',
    'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
    PHP: '#4F5D95', Swift: '#ffac45', 'C#': '#178600', HTML: '#e34c26',
    CSS: '#563d7c', Shell: '#89e051', default: '#58a6ff'
}

export default function ProfileTab({ user: userProp }) {
    const [devCardData, setDevCardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const cardRef = useRef(null)

    useEffect(() => {
        fetchDevCard()
    }, [])

    const fetchDevCard = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/devcard', { credentials: 'include' })
            const json = await res.json()
            if (json.success) setDevCardData(json.data)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    const downloadCard = async () => {
        if (!cardRef.current) return
        try {
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0d1117', scale: 2 })
            const link = document.createElement('a')
            link.download = `devcard-${devCardData.username}.png`
            link.href = canvas.toDataURL()
            link.click()
        } catch (err) { console.error('Download failed:', err) }
    }

    const copyShareText = () => {
        if (!devCardData) return
        const text = `Check out my Dev Metrics! ${devCardData.currentStreak} day streak, ${devCardData.totalCommits} commits across ${devCardData.reposContributed} repos. https://dev-metrics-delta.vercel.app`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading || !devCardData) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const gradientBorder = 'linear-gradient(135deg, #58a6ff 0%, #a371f7 50%, #f0883e 100%)'

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Share Actions */}
            <div className="flex items-center gap-3">
                <button onClick={copyShareText}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl text-sm text-[#8b949e] hover:text-white hover:border-[#58a6ff] transition-all">
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Share Text'}
                </button>
                <button onClick={downloadCard}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#58a6ff] text-[#0d1117] rounded-xl text-sm font-semibold hover:bg-[#79b8ff] transition-colors">
                    <Download size={14} /> Download Card
                </button>
            </div>

            {/* DevCard Preview */}
            <div className="flex justify-center">
                <div
                    ref={cardRef}
                    className="w-full max-w-[440px] rounded-2xl p-7 relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, #161b22 0%, #0d1117 100%)' }}
                >
                    {/* Border glow */}
                    <div className="absolute inset-0 rounded-2xl p-[2px]" style={{ background: gradientBorder, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#58a6ff]/8 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#a371f7]/8 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <img src={devCardData.avatarUrl} alt={devCardData.username}
                                className="w-18 h-18 rounded-full border-2 border-[#30363d]" style={{ width: 64, height: 64 }} crossOrigin="anonymous" />
                            <div>
                                <h3 className="text-white font-bold text-xl">{devCardData.displayName}</h3>
                                <div className="flex items-center gap-1.5 text-[#8b949e] text-sm">
                                    <GitHub size={12} />
                                    <span>@{devCardData.username}</span>
                                </div>
                                {devCardData.bio && <p className="text-[#8b949e] text-xs mt-1.5 line-clamp-2">{devCardData.bio}</p>}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { icon: <Flame size={14} />, val: devCardData.currentStreak, label: 'Day Streak', color: 'text-orange-400' },
                                { icon: <GitBranch size={14} />, val: devCardData.totalCommits, label: 'Commits', color: 'text-[#58a6ff]' },
                                { icon: <FolderGit size={14} />, val: devCardData.reposContributed, label: 'Repos', color: 'text-purple-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-[#0d1117]/80 rounded-xl p-3 text-center border border-[#21262d]">
                                    <div className={`${s.color} mb-1 flex justify-center`}>{s.icon}</div>
                                    <p className="text-white text-2xl font-bold">{s.val}</p>
                                    <p className="text-[#484f58] text-[10px] uppercase tracking-wider">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Languages */}
                        {devCardData.topLangs.length > 0 && (
                            <div className="mb-5">
                                <p className="text-[#8b949e] text-[10px] uppercase tracking-wider mb-2.5">Top Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {devCardData.topLangs.map((lang, i) => (
                                        <span key={i} className="flex items-center gap-1.5 text-xs text-[#e6edf3] bg-[#21262d] px-3 py-1.5 rounded-full border border-[#30363d]">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[lang] || langColors.default }} />
                                            {lang}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                            <div className="flex items-center gap-4 text-[#8b949e] text-xs">
                                <span className="flex items-center gap-1"><Users size={10} /> {devCardData.followers}</span>
                                <span className="flex items-center gap-1"><Code2 size={10} /> {devCardData.publicRepos}</span>
                            </div>
                            <span className="text-[#484f58] text-[10px]">dev-metrics.vercel.app</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Links */}
            <Card className="bg-[#161b22] border-[#21262d]">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-3">
                        <a href={`https://github.com/${devCardData.username}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-lg border border-[#21262d] hover:border-[#58a6ff] transition-all group">
                            <GitHub size={16} className="text-[#8b949e] group-hover:text-[#58a6ff]" />
                            <div>
                                <p className="text-white text-sm font-medium">GitHub Profile</p>
                                <p className="text-[#484f58] text-xs">@{devCardData.username}</p>
                            </div>
                            <ExternalLink size={12} className="ml-auto text-[#484f58] group-hover:text-[#58a6ff]" />
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}