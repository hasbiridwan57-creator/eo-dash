# Dogfood QA Audit Report: EO-Dash Event Ops Command Center

## Executive Summary
- Application: EO-Dash (Vite + React + TypeScript + Tailwind v4 + LocalStorage)
- Test Target: http://localhost:5173/ & http://192.168.110.121:5173/
- Total Issues Discovered: 7 issues (2 Critical, 3 High, 2 Medium)
- Testing Scope: Full multi-template exploration (Konser, Wedding, Corporate, Festival), Financial command center, Vendor payables, Registration & Tickets, Checklist & Risk, Data backup/restore, Mobile viewports.

| ID | Title | Severity | Category | Status |
|---|---|---|---|---|
| ISSUE-01 | Multi-Event Switcher Absent in Navigation Header | Critical | Functional / UX | Queued for Fix |
| ISSUE-02 | Missing Minute-by-Minute Rundown & Cue Sheet Engine | Critical | Feature Gap | Queued for Fix |
| ISSUE-03 | Missing Printable Post-Event Liquidation & Settlement Report | High | Feature Gap | Queued for Fix |
| ISSUE-04 | Emoji Slop in Navigation Tabs & Action Controls | Medium | UI / Visual | Queued for Fix |
| ISSUE-05 | Vendor Details Lack Bank Account, Phone/WA & Rider Specs | High | Data / UX | Queued for Fix |
| ISSUE-06 | Missing Venue Specs & Loading Logistical Schedule | High | Feature Gap | Queued for Fix |
| ISSUE-07 | Missing Committee & Crew Duty Roster with PIC Contacts | Medium | Feature Gap | Queued for Fix |

---

## Detailed Findings

### ISSUE-01: Multi-Event Switcher Absent in Navigation Header
- Severity: Critical
- Category: Functional / UX
- Evidence: App header shows the current event name, but when user creates a second event, there is no dropdown or drawer to switch back to previous events or delete obsolete events.
- Expected: Quick switcher dropdown listing all events in workspace with badges (e.g., Konser, Wedding, Corporate) + active event indicator.

### ISSUE-02: Missing Minute-by-Minute Rundown & Cue Sheet Engine
- Severity: Critical
- Category: Feature Gap (Core EO Requirement)
- Evidence: Only high-level checklist exists. Real-world event execution requires minute-by-minute run-of-show with Start Time, End Time, Activity/Agenda, Stage Location, PIC / Stage Manager, Cue (Lighting/Sound/LED), and Live Status (Upcoming, Standby, Live On-Stage, Done).
- Expected: Dedicated interactive Rundown Tab with real-time cue sheet filters, status toggles, and printing layout.

### ISSUE-03: Missing Printable Post-Event Liquidation & Settlement Report
- Severity: High
- Category: Feature Gap (PRD P1 Priority)
- Evidence: Event organizers must provide formal P&L statements, vendor settlement receipts, and ticket/guest attendance records to clients, sponsors, and investors.
- Expected: Dedicated Liquidation Report modal or view with clean print styling (Window.print / PDF export view) hiding UI chrome.

### ISSUE-04: Emoji Slop in Navigation Tabs & Action Controls
- Severity: Medium
- Category: UI / Visual (Anti-AI-Slop Law #2)
- Evidence: Tab headers contain hardcoded emojis (money bag, clipboard, floppy disk) which degrade enterprise professionalism.
- Expected: Replace all emojis with crisp vector SVG icons (Lucide React: Wallet, ListChecks, CalendarClock, FileSpreadsheet, ShieldCheck, HardDrive).

### ISSUE-05: Vendor Details Lack Bank Account, Phone/WA & Rider Specs
- Severity: High
- Category: Data / UX
- Evidence: Vendor cards only record Name, Category, Fee, and Paid. Real event coordinators need vendor WhatsApp contact, bank account details for transfers, and technical/hospitality rider notes.
- Expected: Extend vendor model with `contact`, `accountNumber`, `bankName`, and `riderNotes`.

### ISSUE-06: Missing Venue Specs & Loading Logistical Schedule
- Severity: High
- Category: Feature Gap
- Evidence: No storage for venue location, capacity, loading-in time, sound curfew, and venue manager contact.
- Expected: Support Venue specification card and logistics schedule.

### ISSUE-07: Missing Committee & Crew Duty Roster with PIC Contacts
- Severity: Medium
- Category: Feature Gap
- Evidence: Tasks have no assigned person, leaving event crew without clear duty rosters on event day.
- Expected: Crew & Committee Roster module with division, name, role, and WhatsApp quick-link.
