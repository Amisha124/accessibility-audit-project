# Accessibility Audit Management Dashboard

**RabTech Academy Internship — Task 04 Upgrade**  
**Task 04 Title:** Responsive Design Tokens & Mobile-First CSS Architecture  
**Task 03 Title:** Semantic HTML5 & Accessible Component Architecture  
**Target Application:** National Portal of India ([https://www.india.gov.in/](https://www.india.gov.in/))  
**Evaluation Standard:** W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA / AAA  
**Baseline Lighthouse Accessibility Score:** **86 / 100** (Automated baseline assessment)

---

## 1. Project Overview

The **Accessibility Audit Management Dashboard** is an enterprise-grade, multi-page web platform engineered to audit, monitor, document, and remediate digital accessibility barriers. Built using semantic HTML5, a mobile-first CSS architecture with comprehensive design tokens, and modular vanilla JavaScript, it bridges the gap between automated scanning tools (such as Google Chrome DevTools Lighthouse) and comprehensive manual accessibility verification protocols.

The project evaluates key user interfaces of the **National Portal of India** against WCAG 2.1 Level AA criteria, records potential accessibility issues in a structured register, provides accessible forms for intake of new findings, delivers technical remediation guidance for engineering teams, and adapts seamlessly across viewports from **320px mobile** up to **1440px wide desktop** in both **light and dark themes**.

> **Audit Scope Notice:**  
> This dashboard documents an academic accessibility audit baseline for RabTech Academy Tasks 03 & 04. It represents recorded observations from automated scans and student manual inspections, and does not alter, certify, or endorse the live government portal.

---

## 2. Key Features (Task 03 & Task 04)

### Mobile-First Responsive Architecture (Task 04)
* **Mobile-First CSS Base**: Core layouts are authored for small screens (320px+) first, progressively enhanced via `min-width` media queries for tablets, desktops, and wide displays.
* **Responsive Breakpoints**:
  * **320px (Base Mobile)**: 1-column layouts, touch-friendly targets (&ge; 44px), off-canvas sidebar drawer with backdrop overlay.
  * **480px (Phablet / Large Mobile)**: Flexible button rows and modal action spacing.
  * **768px (Tablet)**: 2-column metric cards, responsive toolbar layout, and expanded form grids.
  * **1024px (Desktop)**: Transition to sticky desktop sidebar, 4-column metrics, and hidden mobile menu toggle.
  * **1440px (Wide Desktop)**: Expanded container max-width (1360px), generous typography, and refined padding.
* **Zero Horizontal Viewport Overflow**: Tables, forms, and cards adjust gracefully to prevent unintended horizontal scrolling on any device.
* **Touch-Friendly Controls**: Interactive elements meet or exceed the 44&times;44px touch target guideline (WCAG 2.5.5 / 2.5.8).

### CSS Design Tokens & Theme Engine (Task 04)
* **Comprehensive `:root` Token System**: Centralized design tokens for colors, typography scales, 8pt/4pt spacing grids, border radii, layered shadows, and transition curves.
* **Persistent Dark & Light Mode**: Accessible `#theme-toggle` button in the header with `aria-pressed`, live theme switching (`[data-theme="dark"]`), system preference detection (`prefers-color-scheme`), and persistent `localStorage` synchronization.
* **High Contrast in Both Themes**: Text and interactive elements meet or exceed WCAG AA contrast (4.5:1 for body text, 3:1 for large text/icons), with core headings achieving WCAG AAA (>7:1) in both light and dark modes.
* **Modern Visual Design & Glassmorphism**: Frosted glass sticky header (`backdrop-filter: blur(12px)`), soft layered shadows, and smooth hover micro-interactions.

### Multi-Page Enterprise Architecture (Task 03)
* **Dashboard (`index.html`)**: Executive overview featuring the recorded Lighthouse score (86/100), key metrics (recorded findings, items needing verification, active audit status), interactive findings preview table, workflow roadmap, and quick navigation hubs.
* **Findings Register (`findings.html`)**: Issue management workspace with real-time text search, dual-criteria status and priority filtering, dynamic CSV export, template download, and accessible details modal dialogs.
* **Add New Finding (`add-finding.html`)**: WCAG-compliant form allowing auditors to log new issues with auto-suggested IDs, fieldsets/legends, explicit label associations, accessible error summaries (`role="alert"`), inline error feedback, and instant localStorage persistence.
* **Audit Documentation (`documentation.html`)**: Technical reference detailing testing methodology, automated vs. manual coverage comparison, WCAG 2.1 Level AA criteria mappings, visual screenshot evidence from Chrome DevTools, and responsive design artifacts.

### Accessibility Architecture (A11y)
* **Semantic Document Landmarks**: Comprehensive usage of `<header>`, `<nav>`, `<aside>`, `<main id="main">`, `<section>`, `<article>`, and `<footer>`.
* **Skip-to-Main-Content**: First focusable element on every page (`href="#main"`) allowing keyboard and screen-reader users to bypass repetitive navigation.
* **Visible Focus Indicators**: High-visibility 3px amber focus rings (`--focus-ring: #c46800` / `#ffaa33`) with 3px offset applied uniformly via `:focus-visible`.
* **Native `<dialog>` Modals**: HTML5 native dialogs featuring accessible labels (`aria-labelledby`), backdrop blurs, keyboard <kbd>Escape</kbd> dismissal, focus containment, and focus restoration to the trigger element upon closing.
* **Accessible Form Design**: Explicit `<label for="...">` associations, helper descriptions linked via `aria-describedby`, error summary alert container (`role="alert"`), and polite live announcements (`aria-live="polite"`).

---

## 3. Design Tokens Reference

| Category | Token | Light Mode Value | Dark Mode Value | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Brand** | `--primary` | `#075c58` | `#1ab0a6` | Core brand color (WCAG AAA compliant) |
| **Brand** | `--primary-hover` | `#05413e` | `#2cd5c9` | Interactive hover state |
| **Brand** | `--primary-subtle`| `rgba(7,92,88,0.08)` | `rgba(26,176,166,0.16)` | Background tints and pill highlights |
| **Canvas** | `--bg-canvas` | `#f2f5f6` | `#0d1416` | Main page background |
| **Surface**| `--bg-surface` | `#ffffff` | `#141e21` | Cards, panels, and forms |
| **Surface**| `--bg-surface-alt`| `#f8fafb` | `#1a272b` | Table headers, secondary panels |
| **Glass** | `--bg-glass` | `rgba(255,255,255,0.88)`| `rgba(20,30,33,0.88)` | Frosted glass sticky header |
| **Text** | `--text` | `#131d20` (>17:1 ratio) | `#f0f4f5` (>15:1 ratio) | Primary body typography |
| **Text** | `--text-muted` | `#4e6068` (>5.5:1 ratio) | `#a3b3b8` (>6.5:1 ratio) | Secondary descriptions |
| **Status** | `--red` | `#9e1c1c` / `#fdeeee` | `#ff8585` / `rgba(...)` | Open / High priority badge |
| **Status** | `--amber` | `#734500` / `#fff5e0` | `#ffbe4d` / `rgba(...)` | Needs verification / Medium badge |
| **Status** | `--green` | `#116843` / `#eaf8f1` | `#68d99f` / `rgba(...)` | Resolved / Low priority badge |
| **Focus** | `--focus-ring` | `#c46800` (Amber) | `#ffaa33` (Amber) | High visibility outline (WCAG 2.4.7) |
| **Spacing**| `--space-1` to `16`| `0.25rem` (4px) to `4rem` (64px) | Same | 8pt / 4pt spatial system |
| **Radii** | `--radius-xs` to `pill`| `4px`, `8px`, `12px`, `16px`, `9999px` | Same | Border radius scales |
| **Shadows**| `--shadow-sm` to `lg` | Layered subtle elevation | Dark elevation | Elevation and card depths |

---

## 4. Project Structure

```
accessibility-audit-project/
│
├── index.html                           # 1. Executive Dashboard Page
├── findings.html                        # 2. Accessibility Findings Register Page
├── add-finding.html                     # 3. Add New Finding Form Page
├── documentation.html                   # 4. Audit Documentation & Methodology Page
│
├── style.css                            # Mobile-first design tokens & responsive CSS
├── script.js                            # Modular controllers, storage, theme & CSV
├── accessibility-audit-template.csv     # Baseline audit findings template (CSV)
├── README.md                            # Comprehensive project documentation
│
├── screenshots/                         # Visual evidence & responsive layout captures
│   ├── accessibility-dashboard-overview.png   # Original baseline screenshot
│   ├── lighthouse-accessibility-issues.png    # Original baseline screenshot
│   ├── lighthouse-accessibility-score.png     # Original baseline screenshot
│   ├── responsive-mobile-320px.png            # Task 04: Mobile 320px layout
│   ├── responsive-tablet-768px.png            # Task 04: Tablet 768px layout
│   ├── responsive-desktop-1024px.png          # Task 04: Desktop 1024px layout
│   ├── responsive-wide-1440px.png             # Task 04: Wide desktop 1440px layout
│   ├── theme-dark-mode-dashboard.png          # Task 04: Dark theme dashboard
│   └── theme-light-mode-dashboard.png         # Task 04: Light theme dashboard
│
├── validate-pages.js                    # W3C Nu HTML Checker verification script
├── test-suite.js                        # Automated unit & integration test runner (164 tests)
├── run-audit.js                         # Comprehensive 51-checkpoint audit runner
├── capture-screenshots.js               # Chrome headless responsive screenshot generator
└── test-responsive-viewport.js          # Viewport adaptation & overflow verifier
```

---

## 5. Installation & Setup Instructions

### Prerequisites
* Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari).
* Optional (for running automated validation & tests): Node.js (v18.0.0 or later).

### Running the Project Locally

No build step or bundler is required. Simply open the files in your browser:

#### Method A: Direct File Execution
1. Double-click `index.html` in your file explorer, or open it directly in your browser.
2. Navigate between pages using the top navigation bar or sidebar links.
3. Toggle between Light and Dark mode using the `#theme-toggle` button in the top bar.

#### Method B: Local Development Server (Recommended)
Using Python:
```bash
python -m http.server 8000
```
Using Node.js:
```bash
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## 6. How to Run the Test Suite & W3C HTML Validation

### 1. Run the Comprehensive Automated Test Suite (164 Tests)
The project includes an automated test runner (`test-suite.js`) verifying link integrity, semantic landmarks, single-`<h1>` constraints, table structures, form associations, modal handlers, design tokens, theme switching, and responsive breakpoints:
```bash
node test-suite.js
```
Expected output:
```
====================================================
 TEST SUMMARY: Total: 164 | Passed: 164 | Failed: 0
====================================================
🎉 ALL TESTS PASSED SUCCESSFULLY!
```

### 2. Run the Official W3C Nu HTML Checker
The project includes a validation script (`validate-pages.js`) that sends every HTML file directly to the official W3C Nu HTML Checker API (`https://validator.w3.org/nu/?out=json`):
```bash
node validate-pages.js
```
Validation Status:
* `index.html`: **0 errors, 0 warnings (100% Valid HTML5)**
* `findings.html`: **0 errors, 0 warnings (100% Valid HTML5)**
* `add-finding.html`: **0 errors, 0 warnings (100% Valid HTML5)**
* `documentation.html`: **0 errors, 0 warnings (100% Valid HTML5)**

### 3. Run the Comprehensive 51-Point Audit Runner
```bash
node run-audit.js
```
Expected output:
```
================================================================
 FINAL AUDIT SUMMARY: Total Checks: 51 | Passed: 51 | Failed: 0
================================================================
🎉 ALL 13 AUDIT CHECKPOINTS HAVE PASSED WITH 100% SUCCESS!
```

---

## 7. Baseline Recorded Findings Summary

| ID | Affected Component | WCAG Criterion | Priority | Status | Recorded Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WEB-001** | Top Bar Service List | WCAG 2.1 — 1.3.1 (A) | High | Open | Screen readers misinterpret list structure due to orphaned `role="listitem"`. |
| **WEB-002** | Header Overlay Text | WCAG 2.1 — 1.4.3 (AA) | High | Open | Insufficient color contrast on hero text against banner background. |
| **WEB-003** | Website List Components | WCAG 2.1 — 1.3.1 (A) | High | Open | List items missing required `<ul>` or `<ol>` parent elements. |
| **WEB-004** | Interactive Controls | Needs Verification | Medium | Needs verification | Touch target size or spacing concern requiring mobile device testing. |
| **WEB-005** | Repeated Links | Needs Verification | Medium | Needs verification | Multiple identical link labels navigating to different destinations. |

---

## 8. Accessibility Verification Checklist

* [x] **WCAG 2.1 Principle 1: Perceivable**
  * [x] Text color contrast meets minimum 4.5:1 ratio in both light and dark themes (WCAG 1.4.3).
  * [x] Information and relationships conveyable via semantic markup (WCAG 1.3.1).
  * [x] Non-text content has descriptive text alternatives (WCAG 1.1.1).
* [x] **WCAG 2.1 Principle 2: Operable**
  * [x] Fully navigable via keyboard (<kbd>Tab</kbd>, <kbd>Shift+Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Esc</kbd>) (WCAG 2.1.1).
  * [x] Visible focus indicators on all interactive controls in both themes (WCAG 2.4.7).
  * [x] Skip-to-main-content bypass mechanism implemented on all pages (WCAG 2.4.1).
  * [x] No keyboard trap; dialogs contain and restore focus cleanly (WCAG 2.1.2).
  * [x] Target sizes &ge; 44&times;44px on touchscreens (WCAG 2.5.5 / 2.5.8).
* [x] **WCAG 2.1 Principle 3: Understandable**
  * [x] Default language specified via `<html lang="en">` (WCAG 3.1.1).
  * [x] Form inputs have explicit `<label for="...">` associations (WCAG 3.3.2).
  * [x] Accessible error summary container with `role="alert"` (WCAG 3.3.1 / 3.3.3).
* [x] **WCAG 2.1 Principle 4: Robust**
  * [x] Fully valid HTML5 verified against official W3C Nu HTML Checker (WCAG 4.1.1).
  * [x] Dynamic updates announced politely using `aria-live="polite"` (WCAG 4.1.3).
  * [x] Theme state announced via `aria-pressed` on `#theme-toggle` (WCAG 4.1.2).

---

## 9. Academic Disclaimer

This project was developed by RabTech Academy Interns for **Task 03 (Semantic HTML5 & Accessible Component Architecture)** and **Task 04 (Responsive Design Tokens & Mobile-First CSS Architecture)**. All audit findings represent recorded baseline observations for instructional and remediation design purposes. No modification or formal certification of the live National Portal of India website is implied.
