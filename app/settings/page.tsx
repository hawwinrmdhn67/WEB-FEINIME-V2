'use client'

import { useState } from 'react'
import { 
  Settings, User, Key, SunMoon, Save, 
  Mail, PenLine, ShieldCheck, Palette, Camera
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

// ==========================================
// SUB-COMPONENTS (Separated for better performance)
// ==========================================

const ProfileSettings = ({ 
  form, 
  onChange, 
  onSave, 
  isSaving 
}: { 
  form: any, 
  onChange: (e: any) => void, 
  onSave: (e: any) => void, 
  isSaving: boolean 
}) => (
  <form onSubmit={onSave} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <User size={20} className="text-blue-600 dark:text-blue-400" /> Personal Information
            </h3>
            <p className="text-sm text-muted-foreground">Update your photo and public profile details.</p>
        </div>
      </div>
      
      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-secondary/20 rounded-xl border border-border/50">
        <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 overflow-hidden">
                <User size={40} />
            </div>
            <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                <Camera size={14} />
            </button>
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">Profile Picture</h4>
            <p className="text-xs text-muted-foreground mb-3">We recommend using an image of size 500x500px.</p>
            <button type="button" className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors font-medium">
                Change Photo
            </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label htmlFor="displayName" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Display Name</label>
                <div className="flex items-center gap-3 bg-card border border-border hover:border-primary/50 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                    <User size={18} className="text-muted-foreground" />
                    <input 
                    id="displayName" 
                    name="displayName" 
                    type="text" 
                    value={form.displayName} 
                    onChange={onChange}
                    className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground" 
                    required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                    <Mail size={18} className="text-muted-foreground" />
                    <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    readOnly
                    className="bg-transparent outline-none text-sm w-full text-muted-foreground cursor-not-allowed" 
                    />
                </div>
            </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Bio</label>
          <div className="flex items-start gap-3 bg-card border border-border hover:border-primary/50 rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
            <PenLine size={18} className="text-muted-foreground mt-0.5" />
            <textarea 
              id="bio" 
              name="bio" 
              rows={3}
              value={form.bio} 
              onChange={onChange}
              className="bg-transparent outline-none text-sm w-full resize-none text-foreground placeholder:text-muted-foreground" 
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1">Max 150 characters</p>
        </div>
      </div>
    </div>

    <div className="pt-6 border-t border-border flex justify-end">
      <button 
        type="submit" 
        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-primary-foreground font-medium transition-all w-full sm:w-auto shadow-md
          ${isSaving ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 hover:shadow-lg active:scale-95'}`}
        disabled={isSaving}
      >
        {isSaving ? <span className="animate-spin">⏳</span> : <Save size={18} />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
)

const SecuritySettings = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-foreground">
        <Key size={20} className="text-orange-600 dark:text-orange-400" /> Account Security
      </h3>
      <p className="text-sm text-muted-foreground mb-6">Manage your password and account security settings.</p>
      
      <div className="p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full text-orange-600 dark:text-orange-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Password</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Last changed 3 months ago</p>
            </div>
          </div>
          <button className="w-full sm:w-auto px-4 py-2 bg-background border border-border hover:bg-secondary text-sm font-medium rounded-lg transition-colors shadow-sm">
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
        <div className="flex gap-3">
            <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Enabling two-factor authentication (2FA) is highly recommended to enhance your account security. This feature will be available soon.
            </p>
        </div>
      </div>
    </div>
  </div>
)

const AppearanceSettings = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div>
      <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-foreground">
        <Palette size={20} className="text-purple-600 dark:text-purple-400" /> App Appearance
      </h3>
      <p className="text-sm text-muted-foreground mb-6">Customize your visual experience.</p>

      <div className="p-5 bg-card border border-border rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                <SunMoon size={24} />
            </div>
            <div>
              <span className="block font-semibold text-foreground">Dark / Light Theme</span>
              <span className="text-xs text-muted-foreground mt-0.5 block">Use the toggle button in the top Navbar to switch themes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    displayName: 'hawwinrmdhn',
    email: 'hawwin123@gmail.com',
    bio: 'Petinggi antartika',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulation API call
    setTimeout(() => {
      setIsSaving(false)
      alert('Profile settings saved successfully!')
    }, 1500)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-64px)] bg-background p-4 sm:p-6 lg:p-8 pb-20">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER */}
          <header className="mb-8 pb-6 border-b border-border">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-foreground">
              Settings
            </h1>
            <p className="text-sm mt-2 text-muted-foreground ml-1">
              Manage preferences and account information for <b>{profileForm.displayName}</b>.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: NAVIGATION */}
            {/* Desktop: Vertical List (No box background), Mobile: Horizontal Scroll */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2 hidden lg:block">Menu</h2>
                
                {/* Navigation Container */}
                <div className="flex lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 no-scrollbar mask-linear-fade">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                          ${isActive 
                            ? 'bg-primary/10 text-primary font-semibold' 
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                      >
                        <Icon size={18} className={isActive ? 'text-primary' : ''} />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTENT */}
            <div className="lg:col-span-9">
              <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm min-h-[500px]">
                {activeTab === 'profile' && (
                    <ProfileSettings 
                        form={profileForm} 
                        onChange={handleProfileChange} 
                        onSave={handleSaveProfile} 
                        isSaving={isSaving} 
                    />
                )}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}