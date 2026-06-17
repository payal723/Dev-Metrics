'use client'
import { LayoutDashboard, Target, FolderGit, UserCircle } from 'lucide-react'

const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'projects', label: 'Projects', icon: FolderGit },
    { id: 'profile', label: 'Profile', icon: UserCircle },
]

export default function DashboardTabs({ activeTab, onTabChange }) {
    return (
        <div className="flex items-center gap-1 bg-[#161b22] border border-[#21262d] rounded-xl p-1 mb-8 w-fit">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                                ? 'bg-[#21262d] text-white shadow-sm'
                                : 'text-[#8b949e] hover:text-white hover:bg-[#1c2128]'
                        }`}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}