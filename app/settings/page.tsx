'use client'

import { useState, useEffect } from 'react'
import { 
  UserCog, Shield, Bell, Palette, Save, 
  ChevronRight, User, ArrowLeft, Lock, 
  Link
} from 'lucide-react' 
import { Navbar } from '@/components/navbar' 
import { SkeletonLoader } from '@/components/skeleton-loader'
import { Footer } from '@/components/feinime-footer'

// Mock data & Types

interface UserSettings {
  username: string
  email: string
  theme: 'light' | 'dark' | 'system'
  notificationEnabled: boolean
}

const dummySettings: UserSettings = {
  username: 'hawwinrmdhn',
  email: 'user@example.com',
  theme: 'dark',
  notificationEnabled: true,
}

const settingSections = [
    { id: 'profile', label: 'Profile', icon: <User size={18} className="text-blue-500" />, desc: 'Manage account info' },
    { id: 'security', label: 'Security', icon: <Shield size={18} className="text-green-500" />, desc: 'Password & 2FA' },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} className="text-yellow-500" />, desc: 'Email alerts' },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} className="text-pink-500" />, desc: 'Theme settings' },
]

// Helper Components

const ContentHeader = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
    <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/20">
        <h2 className="font-semibold flex items-center gap-2 text-lg">
            {icon} {title}
        </h2>
    </div>
)

const SaveButton = ({ isSaving, label = "Save Changes" }: { isSaving: boolean, label?: string }) => (
    <div className="flex justify-end pt-4 mt-6 border-t border-border/50">
        <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
            {isSaving ? (
                <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save size={16} />
                    {label}
                </>
            )}
        </button>
    </div>
)

const SettingsContentSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-xl border border-border shadow-sm p-4">
                <div className="h-6 w-32 bg-muted dark:bg-muted/70 rounded mb-6"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 w-full bg-muted dark:bg-muted/70 rounded-lg opacity-60"></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-[400px]">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                    <div className="h-6 w-6 bg-muted dark:bg-muted/70 rounded-full"></div>
                    <div className="h-6 w-40 bg-muted dark:bg-muted/70 rounded"></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted dark:bg-muted/70 rounded opacity-70"></div>
                        <div className="h-10 w-full bg-muted dark:bg-muted/70 rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted dark:bg-muted/70 rounded opacity-70"></div>
                        <div className="h-10 w-full bg-muted dark:bg-muted/70 rounded"></div>
                    </div>
                    <div className="h-10 w-32 bg-muted dark:bg-muted/70 rounded ml-auto mt-8"></div>
                </div>
            </div>
        </div>
    </div>
)

export default function UserSettingsPage() { 
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('profile')

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
      current: '',
      new: '',
      confirm: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000)) 
      setSettings(dummySettings)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox'
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined

    setSettings(prev => {
      if (!prev) return null
      return { ...prev, [name]: isCheckbox ? checked : value }
    })
  }

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleSavePassword = async (e: React.FormEvent) => {
      e.preventDefault()
      if (passwordForm.new !== passwordForm.confirm) {
          alert("New password and confirmation do not match!")
          return
      }
      setIsSaving(true)
      await new Promise(resolve => setTimeout(resolve, 1500)) 
      setIsSaving(false)
      setIsChangingPassword(false)
      setPasswordForm({ current: '', new: '', confirm: '' })
      alert("Password successfully changed!")
  }

  const renderContent = () => {
    if (!settings) return null;

    switch (activeSection) {
        case 'profile':
            return (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <ContentHeader title="Account Profile" icon={<User size={20} className="text-primary" />} />
                    <div className="p-6">
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Username</label>
                                <input name="username" value={settings.username} onChange={handleInputChange} 
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                <input name="email" type="email" value={settings.email} onChange={handleInputChange} 
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                            </div>
                            <SaveButton isSaving={isSaving} />
                        </form>
                    </div>
                </div>
            )

        case 'security':
            return (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <ContentHeader title="Security Settings" icon={<Shield size={20} className="text-primary" />} />
                    
                    <div className="p-6">
                        {isChangingPassword ? (
                            <form onSubmit={handleSavePassword} className="space-y-5">
                                <button 
                                    type="button" 
                                    onClick={() => setIsChangingPassword(false)}
                                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                                >
                                    <ArrowLeft size={16} /> Back to Security
                                </button>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                                    <div className="relative">
                                        <input 
                                            name="current" 
                                            type="password" 
                                            value={passwordForm.current}
                                            onChange={handlePasswordInput}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                                            placeholder="Enter current password"
                                        />
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">New Password</label>
                                    <div className="relative">
                                        <input 
                                            name="new" 
                                            type="password" 
                                            value={passwordForm.new}
                                            onChange={handlePasswordInput}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                                            placeholder="Enter new password"
                                        />
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                                    <div className="relative">
                                        <input 
                                            name="confirm" 
                                            type="password" 
                                            value={passwordForm.confirm}
                                            onChange={handlePasswordInput}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
                                            placeholder="Confirm new password"
                                        />
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>

                                <SaveButton isSaving={isSaving} label="Update Password" />
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsChangingPassword(true)}
                                    className="w-full text-left flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-secondary/30 transition-colors group"
                                >
                                     <div>
                                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Change Password</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Last updated 3 months ago</p>
                                     </div>
                                     <ChevronRight size={18} className="text-muted-foreground" />
                                </button>

                                <button type="button" className="w-full text-left flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-secondary/30 transition-colors group">
                                     <div>
                                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">Two-Factor Authentication</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Add extra security layer</p>
                                     </div>
                                     <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded font-bold">DISABLED</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )

        case 'notifications':
             return (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <ContentHeader title="Notifications" icon={<Bell size={20} className="text-primary" />} />
                    <div className="p-6">
                        <form onSubmit={handleSave}>
                            <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-foreground">Email Notifications</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Receive updates about new episodes.</p>
                                </div>
                                <input
                                    name="notificationEnabled"
                                    type="checkbox"
                                    checked={settings.notificationEnabled}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer accent-primary"
                                />
                            </div>
                            <SaveButton isSaving={isSaving} />
                        </form>
                    </div>
                </div>
            )

        case 'appearance':
            return (
                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <ContentHeader title="Appearance" icon={<Palette size={20} className="text-primary" />} />
                    <div className="p-6">
                         <form onSubmit={handleSave} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Color Theme</label>
                                <select
                                    name="theme"
                                    value={settings.theme}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                                >
                                    <option value="light">Light Mode</option>
                                    <option value="dark">Dark Mode</option>
                                    <option value="system">System Default</option>
                                </select>
                            </div>
                            <SaveButton isSaving={isSaving} />
                        </form>
                    </div>
                </div>
            )

        default: return null;
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar /> 
      
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">

        {loading ? (
            <SkeletonLoader type="page-header" />
        ) : (
            <div className="mb-10 text-left"> 
               <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight flex items-center gap-3">
                 Account Settings
               </h1>
               <p className="text-muted-foreground">
                 Manage your preferences and security settings.
               </p>
            </div>
        )}

        {loading ? (
            <SettingsContentSkeleton />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* SIDEBAR MENU */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sticky top-24">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-semibold flex items-center gap-2">
                                <UserCog size={18} className="text-primary" /> Settings Menu
                            </h3>
                        </div>
                        
                        <div className="space-y-1">
                            {settingSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id)
                                        setIsChangingPassword(false)
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group text-left
                                        ${activeSection === section.id 
                                            ? 'bg-secondary/80 text-foreground shadow-sm ring-1 ring-border' 
                                            : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 
                                        ${activeSection === section.id ? 'bg-background shadow-sm' : 'bg-muted/50'}
                                    `}>
                                        {section.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium">{section.label}</h4>
                                        <p className="text-[10px] opacity-70 leading-tight truncate">{section.desc}</p>
                                    </div>
                                    {activeSection === section.id && (
                                        <ChevronRight size={14} className="ml-auto opacity-50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONTENT FORM */}
                <div className="lg:col-span-2">
                    {renderContent()}
                </div>

            </div>
        )}
      </div>
     <Footer />
    </main>
  )
}