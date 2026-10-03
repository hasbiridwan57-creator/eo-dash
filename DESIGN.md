# DESIGN SYSTEM SPECIFICATION: EO-DASH COMMAND CENTER

## 1. Visual Archetype & Principles
- Surface: Monitor & Operate (High-density telemetry, tabular precision, zero decorative fluff, zero centered hero slop).
- Aesthetic: Deep Midnight HUD & Cyber-Industrial Studio.
- Color Philosophy: #020617 (Canvas), #0B1120 (Surface Card), #1E293B (Hairline 1px Border).
- Strict Invariant: Zero emojis in all copy, buttons, badges, labels. Vector Lucide SVG icons exclusively.

## 2. Color Palette
- Canvas Background: #020617 (slate-950)
- Elevated Surface: #0B1120 (slate-900/60 with backdrop-blur-md)
- Border / Hairline: #1E293B (slate-800), Hover: #334155 (slate-700)
- Accents:
  - Emerald (Cash Inflow, Profit, Paid, Validated): #10B981, Glass: bg-emerald-500/10 text-emerald-400 border-emerald-500/30
  - Cyan (Telemetry, Controls, Active Nav): #06B6D4, Glass: bg-cyan-500/10 text-cyan-400 border-cyan-500/30
  - Rose (Danger, Outflow, Overdue, Critical Risk): #F43F5E, Glass: bg-rose-500/10 text-rose-400 border-rose-500/30
  - Indigo / Violet (RSVP, Delegation, Planning): #6366F1, Glass: bg-indigo-500/10 text-indigo-400 border-indigo-500/30
  - Amber (Warning, Pending, Commitments): #F59E0B, Glass: bg-amber-500/10 text-amber-400 border-amber-500/30

## 3. Typography Hierarchy
- Font Family: Inter / system-ui, Data/Numbers: SF Mono, JetBrains Mono, monospace tabular.
- Headings:
  - H1 Event Title: 32px - 36px, font-extrabold, tracking-tight, text-white
  - H2 Section Header: 20px - 22px, font-bold, text-slate-100
  - H3 Card Header: 15px - 16px, font-semibold, text-slate-200
  - Body Text: 13px - 14px, font-normal, text-slate-400
  - Captions / Meta: 11px - 12px, font-medium, text-slate-500

## 4. Spacing, Radius & Geometry
- Spacing Scale: 4px, 8px, 12px, 16px, 24px, 32px
- Border Radius:
  - Container / Cards: rounded-3xl (24px)
  - Modals & Banners: rounded-3xl (24px)
  - Interactive Buttons / Inputs: rounded-2xl (16px) or rounded-xl (12px)
  - Badges & Status Pills: rounded-full (9999px)

## 5. Component Specifications & Micro-Interactions
- Primary Action Buttons:
  - Height: >= 38px (desktop), >= 44px (touch mobile)
  - Focus Ring: ring-2 ring-emerald-500/50 outline-none
  - Transition: 150ms ease-out
  - Hover: subtle glow (shadow-[0_0_20px_rgba(16,185,129,0.25)])
  - Active Press: scale-[0.98]
- Tables & List Items:
  - Striped or bordered rows with hover:bg-slate-800/40
  - Quick action affordances (Edit, Delete, Toggle, Pay) aligned to right edge
- Navigation Tabs:
  - Horizontal scrollable on mobile, flex on desktop
  - Active: bg-emerald-500 text-slate-950 font-bold shadow-lg
  - Inactive: bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800
