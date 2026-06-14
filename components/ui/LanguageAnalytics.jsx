'use client'
import { useState, useEffect } from 'react';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { Code2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#58a6ff', '#a371f7', '#3fb950', '#f0883e', '#f85149', '#d2a8ff', '#79c0ff', '#56d364'];

const langColors = {
    JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
    Ruby: '#701516', PHP: '#4F5D95', Swift: '#ffac45', 'C#': '#178600',
    HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', default: '#58a6ff'
};

export default function LanguageAnalytics() {
    const [langData, setLangData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            const res = await fetch('https://dev-metrics-cd6k.onrender.com/api/languages', {
                credentials: 'include'
            });
            const json = await res.json();
            if (json.success) setLangData(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!langData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Radar Chart */}
            <Card className="bg-[#161b22] border-[#30363d]">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-[#a371f7]" />
                        <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                            Skill Radar
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={langData.skillRadar}>
                            <PolarGrid stroke="#30363d" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#484f58', fontSize: 10 }} />
                            <Radar
                                name="Skills"
                                dataKey="score"
                                stroke="#a371f7"
                                fill="#a371f7"
                                fillOpacity={0.25}
                                strokeWidth={2}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#161b22', 
                                    border: '1px solid #30363d', 
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: '#fff'
                                }} 
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Language Breakdown */}
            <Card className="bg-[#161b22] border-[#30363d]">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Code2 size={16} className="text-[#58a6ff]" />
                            <CardTitle className="text-sm text-[#8b949e] uppercase tracking-widest font-normal">
                                Language Breakdown
                            </CardTitle>
                        </div>
                        <Badge className="bg-[#21262d] text-[#8b949e] border-[#30363d] text-xs">
                            {langData.totalReposAnalyzed} repos
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Donut Chart */}
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={langData.languages}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="bytes"
                            >
                                {langData.languages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={langColors[entry.name] || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#161b22', 
                                    border: '1px solid #30363d', 
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                                formatter={(value, name) => [name, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {langData.languages.slice(0, 6).map((lang, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: langColors[lang.name] || COLORS[i] }}
                                />
                                <span className="text-[#8b949e] text-xs">{lang.name}</span>
                                <span className="text-white text-xs font-medium">{lang.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}