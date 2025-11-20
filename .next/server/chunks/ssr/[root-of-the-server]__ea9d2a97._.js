module.exports=[18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},42602,(a,b,c)=>{"use strict";b.exports=a.r(18622)},87924,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactJsxRuntime},72131,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].React},4365,a=>{"use strict";var b=a.i(87924),c=a.i(72131);function d({children:a}){let[d,e]=(0,c.useState)(!1),[f,g]=(0,c.useState)("dark");(0,c.useEffect)(()=>{let a=localStorage.getItem("theme"),b=window.matchMedia("(prefers-color-scheme: dark)").matches,c=a||(b?"dark":"light");g(c),h(c),e(!0)},[]);let h=a=>{let b=document.documentElement;"dark"===a?b.classList.add("dark"):b.classList.remove("dark")};return d?(0,b.jsxs)(b.Fragment,{children:[a,(0,b.jsx)("script",{suppressHydrationWarning:!0,children:`
          const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        `})]}):(0,b.jsx)(b.Fragment,{children:a})}a.s(["ThemeProvider",()=>d])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__ea9d2a97._.js.map