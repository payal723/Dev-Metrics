// 'use client'
// import { useState, useEffect, useRef } from 'react';
// import {  Download, Share2, GitHub, GitBranch, Flame, Calendar, Code2, Users, FolderGit, Copy, Check } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

'use client'
import { useState, useEffect, useRef } from 'react';
import {
  Download,
  Share2,
  GitBranch,
  Flame,
  Code2,
  Users,
  FolderGit,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const langColors = {
    JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
    Ruby: '#701516', PHP: '#4F5D95', Swift: '#ffac45', 'C#': '#178600',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', React: '#61dafb',
    Vue: '#41b883', default: '#58a6ff'
};

export default function DevCard() {
    const [devCardData, setDevCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        fetchDevCard();
    }, []);

    const fetchDevCard = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/devcard', {
                credentials: 'include'
            });
            const json = await res.json();
            if (json.success) setDevCardData(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadCard = async () => {
        if (!cardRef.current) return;
        // Use html2canvas for download
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0d1117',
                scale: 2
            });
            const link = document.createElement('a');
            link.download = `devcard-${devCardData.username}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const copyShareText = () => {
        if (!devCardData) return;
        const text = `Check out my Dev Metrics! ${devCardData.currentStreak} day streak, ${devCardData.totalCommits} commits across ${devCardData.reposContributed} repos. dev-metrics-delta.vercel.app`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return null;
    if (!devCardData) return null;

    const gradientBorder = 'linear-gradient(135deg, #58a6ff 0%, #a371f7 50%, #f0883e 100%)';

    return (
        <Card className="bg-[#161b22] border-[#30363d] mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-[#a371f7]" />
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            My DevCard
                        </CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={copyShareText}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-white hover:border-[#58a6ff] transition-all">
                            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                        <button onClick={downloadCard}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#58a6ff] text-[#0d1117] rounded-lg text-xs font-semibold hover:bg-[#79b8ff] transition-colors">
                            <Download size={12} />
                            Download
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* The actual card */}
                <div className="flex justify-center">
                    <div 
                        ref={cardRef}
                        className="w-full max-w-[420px] rounded-2xl p-6 relative overflow-hidden"
                        style={{ 
                            background: 'linear-gradient(145deg, #161b22 0%, #0d1117 100%)',
                            border: '2px solid transparent',
                            backgroundClip: 'padding-box'
                        }}
                    >
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 rounded-2xl p-[2px]" style={{ background: gradientBorder, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                        
                        {/* Subtle glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#58a6ff]/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#a371f7]/10 rounded-full blur-3xl" />

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-5">
                                <img 
                                    src={devCardData.avatarUrl} 
                                    alt={devCardData.username}
                                    className="w-16 h-16 rounded-full border-2 border-[#30363d]"
                                    crossOrigin="anonymous"
                                />
                                <div>
                                    <h3 className="text-white font-bold text-lg">{devCardData.displayName}</h3>
                                   <div className="flex items-center gap-1.5 text-[#8b949e] text-sm">
                               <FolderGit size={12} />
                            <span>@{devCardData.username}</span>
                                   </div>
                                    {devCardData.bio && (
                                        <p className="text-[#8b949e] text-xs mt-1 line-clamp-2">{devCardData.bio}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[
                                    { icon: <Flame size={14} />, value: devCardData.currentStreak, label: 'Day Streak', color: 'text-orange-400' },
                                    { icon: <GitBranch size={14} />, value: devCardData.totalCommits, label: 'Commits', color: 'text-[#58a6ff]' },
                                    { icon: <FolderGit size={14} />, value: devCardData.reposContributed, label: 'Repos', color: 'text-purple-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#0d1117]/80 rounded-xl p-3 text-center border border-[#21262d]">
                                        <div className={`${stat.color} mb-1 flex justify-center`}>{stat.icon}</div>
                                        <p className="text-white text-xl font-bold">{stat.value}</p>
                                        <p className="text-[#8b949e] text-[10px] uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Languages */}
                            {devCardData.topLangs.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-[#8b949e] text-[10px] uppercase tracking-wider mb-2">Top Languages</p>
                                    <div className="flex flex-wrap gap-2">
                                        {devCardData.topLangs.map((lang, i) => (
                                            <span key={i} className="flex items-center gap-1.5 text-xs text-[#e6edf3] bg-[#21262d] px-2.5 py-1 rounded-full border border-[#30363d]">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[lang] || langColors.default }} />
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                                <div className="flex items-center gap-3 text-[#8b949e] text-xs">
                                    <span className="flex items-center gap-1"><Users size={10} /> {devCardData.followers}</span>
                                    <span className="flex items-center gap-1"><Code2 size={10} /> {devCardData.publicRepos} repos</span>
                                </div>
                                <span className="text-[#484f58] text-[10px]">dev-metrics.vercel.app</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}