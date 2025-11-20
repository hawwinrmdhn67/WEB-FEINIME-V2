(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89554,e=>{"use strict";var t=e.i(43476),r=e.i(71645);function s({children:e}){let[s,a]=(0,r.useState)(!1),[c,d]=(0,r.useState)("dark");(0,r.useEffect)(()=>{let e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches,r=e||(t?"dark":"light");d(r),o(r),a(!0)},[]);let o=e=>{let t=document.documentElement;"dark"===e?t.classList.add("dark"):t.classList.remove("dark")};return s?(0,t.jsxs)(t.Fragment,{children:[e,(0,t.jsx)("script",{suppressHydrationWarning:!0,children:`
          const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        `})]}):(0,t.jsx)(t.Fragment,{children:e})}e.s(["ThemeProvider",()=>s])}]);