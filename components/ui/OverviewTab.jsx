'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Flame, Trophy, GitBranch,Target, Clock, Sparkles, GitPullRequest, AlertCircle, CheckCircle2, MinusCircle, Zap, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const iconMap = {
    zap: Zap, clock: Clock, flame: Flame, alert: AlertCircle,
    target: TargetIcon, coffee: CoffeeIcon, 'trending-up': TrendingUp,
    'trending-down': TrendingDown, moon: MoonIcon
}

function TargetIcon(props) { return <Target {...props} /> }
function CoffeeIcon(props) { return <Calendar {...props} /> }
function TrendingDown(props) { return <TrendingUp {...props} className="rotate-180" /> }
function MoonIcon(props) { return <Clock {...props} /> }

const severityStyles = {
    positive: { bg: 'bg-green-500/5', border: 'border-l-green-500', icon: 'text-green-400' },
    warning: { bg: 'bg-yellow-500/5', border: 'border-l-yellow-500', icon: 'text-yellow-400' },
    negative: { bg: 'bg-red-500/5', border: 'border-l-red-500', icon: 'text-red-400' }
}

export default function OverviewTab({ heatmap, repos, user, stats }) {
    const [insightsData, setInsightsData] = useState(null)
    const [reviewsData, setReviewsData] = useState(null)
    const [loadingInsights, setLoadingInsights] = useState(true)
    const [loadingReviews, setLoadingReviews] = useState(true)

    const totalPushes = heatmap.reduce((sum, d) => sum + d.count, 0)

    useEffect(() => {
        fetchInsights()
        fetchReviews()
    }, [])

    const fetchInsights = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/insights', { credentials: 'include' })
            const json = await res.json()
            if (json.success) setInsightsData(json.data)
        } catch (err) { console.error(err) }
        finally { setLoadingInsights(false) }
    }

    const fetchReviews = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/reviews', { credentials: 'include' })
            const json = await res.json()
            if (json.success) setReviewsData(json.data)
        } catch (err) { console.error(err) }
        finally { setLoadingReviews(false) }
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Hero Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: <Flame size={16} className="text-orange-400" />, label: 'Current Streak', value: stats?.currentStreak ?? 0, sub: 'days in a row', color: 'text-orange-400' },
                    { icon: <Trophy size={16} className="text-yellow-400" />, label: 'Best Streak', value: stats?.longestStreak ?? 0, sub: 'days ever', color: 'text-yellow-400' },
                    { icon: <GitBranch size={16} className="text-[#58a6ff]" />, label: 'Total Pushes', value: totalPushes, sub: 'last 30 days', color: 'text-[#58a6ff]' },
                    { icon: <Clock size={16} className="text-purple-400" />, label: 'Peak Time', value: stats?.mostActiveTime ?? '-', sub: stats?.mostActiveDay ?? '-', color: 'text-purple-400' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-[#161b22] border-[#21262d]">
                        <CardContent className="pt-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                {stat.icon}
                                <span className="text-[#8b949e] text-[10px] uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-[#8b949e] text-xs mt-0.5">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* AI Insights + Review Backlog side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights */}
                <Card className="bg-[#161b22] border-[#30363d]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-[#f0883e]" />
                                <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">AI Insights</CardTitle>
                            </div>
                            {!loadingInsights && insightsData && (
                                <Badge className="bg-[#f0883e]/10 text-[#f0883e] border-[#f0883e]/30 text-xs">{insightsData.totalInsights} detected</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingInsights ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-[#0d1117] rounded-lg border border-[#21262d] animate-pulse" />
                                ))}
                            </div>
                        ) : insightsData?.insights?.length > 0 ? (
                            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                {insightsData.insights.map((insight, i) => {
                                    const Icon = iconMap[insight.icon] || Zap
                                    const style = severityStyles[insight.severity]
                                    return (
                                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border border-[#21262d] ${style.bg} ${style.border} border-l-[3px] transition-all hover:border-[#30363d]`}>
                                            <Icon size={14} className={`${style.icon} mt-0.5 flex-shrink-0`} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-white text-xs font-semibold">{insight.title}</h4>
                                                    <Badge className="bg-[#21262d] text-[#8b949e] text-[9px] px-1">{insight.metric}</Badge>
                                                </div>
                                                <p className="text-[#8b949e] text-[11px] leading-relaxed">{insight.message}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-[#8b949e] text-sm text-center py-6">No insights yet. Keep coding!</p>
                        )}
                    </CardContent>
                </Card>

                {/* Review Backlog — NEW UNIQUE FEATURE */}
                <Card className="bg-[#161b22] border-[#30363d]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GitPullRequest size={16} className="text-[#f85149]" />
                                <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">Review Backlog</CardTitle>
                            </div>
                            {!loadingReviews && reviewsData && (
                                <Badge className={`${reviewsData.pendingCount > 5 ? 'bg-red-900/60 text-red-300' : reviewsData.pendingCount > 0 ? 'bg-yellow-900/60 text-yellow-300' : 'bg-green-900/60 text-green-300'} text-xs`}>
                                    {reviewsData.pendingCount} pending
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingReviews ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 bg-[#0d1117] rounded-lg border border-[#21262d] animate-pulse" />
                                ))}
                            </div>
                        ) : reviewsData?.pendingReviews?.length > 0 ? (
                            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                {reviewsData.pendingReviews.map((pr, i) => (
                                    <a key={i} href={pr.url} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-lg border border-[#21262d] hover:border-[#f85149]/50 transition-all group">
                                        <div className="w-8 h-8 bg-[#f85149]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <GitPullRequest size={14} className="text-[#f85149]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium truncate group-hover:text-[#f85149] transition-colors">{pr.title}</p>
                                            <p className="text-[#8b949e] text-[10px]">{pr.repo} · opened {pr.daysOpen}d ago by {pr.author}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {pr.comments > 0 && (
                                                <span className="text-[#8b949e] text-[10px] flex items-center gap-0.5">
                                                    <AlertCircle size={10} /> {pr.comments}
                                                </span>
                                            )}
                                            <span className={`w-1.5 h-1.5 rounded-full ${pr.daysOpen > 7 ? 'bg-red-500' : pr.daysOpen > 3 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
                                <p className="text-green-400 text-sm font-medium">All caught up!</p>
                                <p className="text-[#8b949e] text-xs mt-1">No pending PR reviews</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Commit Activity Chart */}
            <Card className="bg-[#161b22] border-[#30363d]">
                <CardHeader>
                    <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">Commit Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={heatmap} barCategoryGap="30%">
                            <XAxis dataKey="date" stroke="#484f58" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis stroke="#484f58" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#21262d' }}
                                contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#58a6ff" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}