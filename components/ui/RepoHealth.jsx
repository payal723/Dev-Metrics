'use client'
import { useState, useEffect } from 'react';
import { 
    HeartPulse, GitPullRequest, CircleDot, AlertCircle, 
    CheckCircle2, TrendingUp, Star, ExternalLink 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const statusConfig = {
    healthy: { color: 'text-green-400', bg: 'bg-green-500', badge: 'bg-green-900/60 text-green-300', icon: <CheckCircle2 size={14} />, label: 'Healthy' },
    needs_attention: { color: 'text-yellow-400', bg: 'bg-yellow-500', badge: 'bg-yellow-900/60 text-yellow-300', icon: <AlertCircle size={14} />, label: 'Needs Attention' },
    at_risk: { color: 'text-red-400', bg: 'bg-red-500', badge: 'bg-red-900/60 text-red-300', icon: <AlertCircle size={14} />, label: 'At Risk' }
};

export default function RepoHealth() {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/repohealth', {
                credentials: 'include'
            });
            const json = await res.json();
            if (json.success) setHealthData(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!healthData?.repos?.length) return null;

    return (
        <Card className="bg-[#161b22] border-[#30363d] mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HeartPulse size={16} className="text-[#f85149]" />
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            Project Health
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[#8b949e]">{healthData.healthyRepos} healthy</span>
                        </div>
                        {healthData.atRiskRepos > 0 && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[#8b949e]">{healthData.atRiskRepos} at risk</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Overall Health */}
                <div className="mb-6 p-4 bg-[#0d1117] rounded-xl border border-[#21262d]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[#8b949e] text-xs uppercase tracking-wider">Overall Health Score</span>
                        <span className={`text-lg font-bold ${healthData.overallHealth >= 75 ? 'text-green-400' : healthData.overallHealth >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {healthData.overallHealth}%
                        </span>
                    </div>
                    <div className="h-3 bg-[#21262d] rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ${healthData.overallHealth >= 75 ? 'bg-green-500' : healthData.overallHealth >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${healthData.overallHealth}%` }}
                        />
                    </div>
                </div>

                {/* Per-repo cards */}
                <div className="space-y-3">
                    {healthData.repos.map((repo, i) => {
                        const status = statusConfig[repo.status];
                        return (
                            <div key={i} className="p-4 bg-[#0d1117] rounded-xl border border-[#21262d] hover:border-[#30363d] transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-semibold text-sm">{repo.name}</h4>
                                        <Badge className={`${status.badge} text-[10px] px-1.5`}>
                                            {status.icon} {status.label}
                                        </Badge>
                                    </div>
                                    <a href={repo.url} target="_blank" rel="noreferrer" className="text-[#484f58] hover:text-[#58a6ff] transition-colors">
                                        <ExternalLink size={12} />
                                    </a>
                                </div>

                                {/* Health bar */}
                                <div className="mb-3">
                                    <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${status.bg} transition-all`} style={{ width: `${repo.healthScore}%` }} />
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#8b949e] mb-0.5">
                                            <GitPullRequest size={10} />
                                        </div>
                                        <p className="text-white text-sm font-bold">{repo.prStats.mergeRate}%</p>
                                        <p className="text-[#484f58] text-[10px]">PR Merge</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#8b949e] mb-0.5">
                                            <CircleDot size={10} />
                                        </div>
                                        <p className="text-white text-sm font-bold">{repo.issueStats.open}</p>
                                        <p className="text-[#484f58] text-[10px]">Open Issues</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#8b949e] mb-0.5">
                                            <TrendingUp size={10} />
                                        </div>
                                        <p className="text-white text-sm font-bold">{repo.issueStats.avgResolutionDays}d</p>
                                        <p className="text-[#484f58] text-[10px]">Avg Fix Time</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-[#8b949e] mb-0.5">
                                            <Star size={10} />
                                        </div>
                                        <p className="text-white text-sm font-bold">{repo.stars}</p>
                                        <p className="text-[#484f58] text-[10px]">Stars</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}