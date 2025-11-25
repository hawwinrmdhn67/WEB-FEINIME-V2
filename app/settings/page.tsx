'use client'

import { useState, useEffect } from 'react'
import { 
  UserCog, Shield, Bell, Palette, Save, 
  ChevronRight, User, ArrowLeft, Lock, 
  Link
} from 'lucide-react' 
import { Navbar } from '@/components/navbar' 
import { SkeletonLoader } from '@/components/skeleton-loader'

// ===================================
// 1. DATA MOCK & TYPES
// ===================================

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

// ===================================
// 2. HELPER COMPONENTS
// ===================================

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

// ===================================
// 3. SKELETON (CONTENT ONLY)
// ===================================
const SettingsContentSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
        {/* Sidebar Skeleton (Left) */}
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

        {/* Content Area Skeleton (Right) */}
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

// ===================================
// 4. MAIN COMPONENT
// ===================================

export default function UserSettingsPage() { 
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('profile')

  // --- State Khusus Change Password ---
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
      current: '',
      new: '',
      confirm: ''
  })

  // --- Fetch Data ---
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000)) 
      setSettings(dummySettings)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  // --- Handlers ---
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

  // --- Render Form Content ---
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
      
      {/* CONTAINER: max-w-7xl dan py-12 (Konsisten dengan Dashboard & Activity) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        
        {/* ===================================
            HEADER SECTION
           =================================== */}
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

        {/* ===================================
            CONTENT SECTION
           =================================== */}
        {loading ? (
            // Skeleton Khusus Settings (2 Kolom)
            <SettingsContentSkeleton />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: SIDEBAR MENU */}
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

                {/* RIGHT: CONTENT FORM */}
                <div className="lg:col-span-2">
                    {renderContent()}
                </div>

            </div>
        )}
      </div>
      {/* Responsive Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Flex container utama */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-12">

            {/* Brand */}
            <div className="text-center md:text-left">
              <span className="font-bold text-xl tracking-tight">Feinime</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
              {['Home', 'Popular', 'Trending', 'About', 'Contact', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.955-2.178-1.55-3.594-1.55-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.087-.205-7.72-2.164-10.148-5.144-.424.722-.666 1.561-.666 2.475 0 1.708.87 3.214 2.188 4.099-.807-.025-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.416-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.779-.023-1.158-.067 2.189 1.402 4.768 2.217 7.548 2.217 9.051 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63 1.009-.73 1.884-1.64 2.584-2.675z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-[#5865F2] transition-colors"
              >
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.55A59 59 0 0 0 46.92 0c-.65 1.14-1.39 2.59-1.9 3.74a42 42 0 0 0-17 0C27.5 2.6 26.76 1.15 26.1 0A58.8 58.8 0 0 0 10.9 4.55C2.68 19.28.08 33.43 1.3 47.36c11.04 8.16 21.56 6.06 21.56 6.06 1.44-1.84 2.56-3.78 3.44-5.7-6.16-1.84-8.52-4.52-8.52-4.52.72.48 1.44.92 2.16 1.3 4.92 2.52 10.12 3.78 15.44 3.78s10.52-1.26 15.44-3.78c.72-.38 1.44-.82 2.16-1.3 0 0-2.36 2.68-8.52 4.52.88 1.92 2 3.86 3.44 5.7 0 0 10.52 2.1 21.56-6.06 1.22-13.92-1.38-28.07-9.6-42.8ZM24.76 37.34c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Zm21.48 0c-3.12 0-5.68-2.82-5.68-6.28 0-3.46 2.52-6.28 5.68-6.28 3.18 0 5.74 2.82 5.68 6.28 0 3.46-2.5 6.28-5.68 6.28Z" />
                </svg>
              </a>
            </div>

          </div>

          {/* COPYRIGHT */}
          <div className="border-t border-border mt-8 pt-6 text-center text-muted-foreground text-sm">
            <p>Feinime © 2025. All rights reserved.</p>
          </div>

        </div>
      </footer>
    </main>
  )
}