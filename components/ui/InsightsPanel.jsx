'use client'
import { useState, useEffect } from 'react';
import { 
    Zap, Clock, Flame, AlertTriangle, Target, GitBranch, 
    Coffee, TrendingUp, TrendingDown, Moon, ChevronRight, Sparkles 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const iconMap = {
    zap: Zap,
    clock: Clock,
    flame: Flame,
    alert: AlertTriangle,
    target: Target,
    'git-branch': GitBranch,
    coffee: Coffee,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    moon: Moon
};

const severityStyles = {
    positive: { badge: 'bg-green-900/60 text-green-300 border-green-700', border: 'border-l-green-500', bg: 'bg-green-500/5' },
    warning: { badge: 'bg-yellow-900/60 text-yellow-300 border-yellow-700', border: 'border-l-yellow-500', bg: 'bg-yellow-500/5' },
    negative: { badge: 'bg-red-900/60 text-red-300 border-red-700', border: 'border-l-red-500', bg: 'bg-red-500/5' }
};

export default function InsightsPanel() {
    const [insightsData, setInsightsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/insights', {
                credentials: 'include'
            });
            const json = await res.json();
            if (json.success) setInsightsData(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!insightsData?.insights?.length) return null;

    return (
        <Card className="bg-[#161b22] border-[#30363d] mb-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#f0883e]" />
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            AI Smart Insights
                        </CardTitle>
                    </div>
                    <Badge className="bg-[#f0883e]/10 text-[#f0883e] border-[#f0883e]/30 text-xs">
                        {insightsData.totalInsights} detected
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insightsData.insights.map((insight, i) => {
                        const Icon = iconMap[insight.icon] || Zap;
                        const style = severityStyles[insight.severity];
                        
                        return (
                            <div 
                                key={i} 
                                className={`flex items-start gap-3 p-4 rounded-xl border border-[#21262d] ${style.bg} ${style.border} border-l-4 transition-all hover:border-[#30363d] hover:scale-[1.01]`}
                            >
                                <div className={`p-2 rounded-lg ${style.badge.split(' ')[0]} mt-0.5`}>
                                    <Icon size={16} className={insight.severity === 'positive' ? 'text-green-300' : insight.severity === 'warning' ? 'text-yellow-300' : 'text-red-300'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-white text-sm font-semibold">{insight.title}</h4>
                                        <Badge className={`${style.badge} text-[10px] px-1.5 py-0`}>
                                            {insight.metric}
                                        </Badge>
                                    </div>
                                    <p className="text-[#8b949e] text-xs leading-relaxed">{insight.message}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}