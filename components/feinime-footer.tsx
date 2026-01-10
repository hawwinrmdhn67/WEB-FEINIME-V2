'use client'

import Image from 'next/image'
import { Twitter, Github, Instagram } from 'lucide-react'

const EXPLORE = ['Home', 'Popular', 'Trending', 'New']
const COMMUNITY = ['Forums', 'Events', 'Blog', 'Contribute']
const SUPPORT = ['About', 'Contact', 'FAQ', 'Help Center']
const LEGAL = ['Terms', 'Privacy', 'Cookies', 'Licenses'] 

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-surface border-t border-border mt-auto text-sm">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">

        {/* GRID SYSTEM */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-10 gap-x-8 lg:gap-12 items-start w-full">

          {/* BRAND SECTION */}
          <div className="col-span-2 lg:col-span-2 space-y-4 flex flex-col items-start mr-4">
            <a href="/" aria-label="Feinime home" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-border/50">
                <Image 
                  src="/feinime.jpg" 
                  alt="Feinime logo" 
                  width={40} 
                  height={40} 
                  className="object-cover transition-transform duration-300 group-hover:scale-110" 
                  priority 
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                Feinime
              </span>
            </a>

            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Discover and keep track of your favorite anime curated lists, top picks, and community favorites.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: Twitter, href: "https://twitter.com" },
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Github, href: "https://github.com" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 -ml-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* LINK SECTIONS */}
          
          {/* Kolom 1 */}
          <div>
            <h4 className="font-semibold text-foreground tracking-wide mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {EXPLORE.map(item => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors block w-max">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 2 */}
          <div>
            <h4 className="font-semibold text-foreground tracking-wide mb-4">Community</h4>
            <ul className="space-y-2.5">
              {COMMUNITY.map(item => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors block w-max">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 */}
          <div>
            <h4 className="font-semibold text-foreground tracking-wide mb-4">Support</h4>
            <ul className="space-y-2.5">
              {SUPPORT.map(item => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors block w-max">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

           {/* Kolom 4 */}
           <div>
            <h4 className="font-semibold text-foreground tracking-wide mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL.map(item => (
                <li key={item}>
                  <a href={`/${item.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors block w-max">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Feinime. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm sm:ml-auto">
             Made with hawwinrmdhn67
          </p>
        </div>
      </div>
    </footer>
  )
}