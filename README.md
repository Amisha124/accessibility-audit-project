# Accessibility Audit Management Dashboard

**RabTech Academy Internship — Task 03**  
**Task Title:** Semantic HTML5 & Accessible Component Architecture  
**Target Application:** National Portal of India ([https://www.india.gov.in/](https://www.india.gov.in/))  
**Evaluation Standard:** W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA  
**Baseline Lighthouse Accessibility Score:** **86 / 100** (Automated baseline assessment)

---

## 1. Project Overview

The **Accessibility Audit Management Dashboard** is an enterprise-grade, multi-page web application engineered to audit, monitor, document, and remediate digital accessibility barriers. Built using semantic HTML5, modern CSS3 design tokens, and modular vanilla JavaScript, it bridges the gap between automated scanning tools (such as Google Chrome DevTools Lighthouse) and comprehensive manual accessibility verification protocols.

The project evaluates key user interfaces of the **National Portal of India** against WCAG 2.1 Level AA criteria, records potential accessibility issues in a structured register, provides accessible forms for intake of new findings, and delivers technical remediation guidance for engineering teams.

> **Audit Scope Notice:**  
> This dashboard documents an academic accessibility audit baseline for RabTech Academy Task 03. It represents recorded observations from automated scans and student manual inspections, and does not alter, certify, or endorse the live government portal.

---

## 2. Key Features

### Multi-Page Enterprise Architecture
* **Dashboard (`index.html`)**: High-level executive overview featuring the recorded Lighthouse score (86/100), key metrics (recorded findings, items needing verification, active audit status), interactive findings preview table, workflow roadmap, and quick navigation hubs.
* **Findings Register (`findings.html`)**: Full-featured issue management workspace with real-time text search, dual-criteria status and priority filtering, dynamic CSV export, template download, and accessible details modal dialogs.
* **Add New Finding (`add-finding.html`)**: Production-ready, WCAG-compliant form allowing auditors to log new issues with auto-suggested IDs, fieldsets/legends, explicit label associations, accessible error summaries (`role="alert"`), inline error feedback, and instant localStorage persistence.
* **Audit Documentation (`documentation.html`)**: In-depth technical reference detailing testing methodology, automated vs. manual coverage comparison, WCAG 2.1 Level AA criteria mappings, visual screenshot evidence from Chrome DevTools, and architecture principles.

### Accessibility Architecture (A11y)
* **Semantic Document Landmarks**: Comprehensive usage of `<header>`, `<nav>`, `<aside>`, `<main id="main">`, `<section>`, `<article>`, and `<footer>` ensuring a fully navigable accessibility tree.
* **Skip-to-Main-Content**: First focusable element on every page (`href="#main"`) allowing keyboard and screen-reader users to bypass repetitive navigation.
* **WCAG 2.1 Color Contrast**: All text and interactive elements satisfy or exceed WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/icons), with core headings achieving WCAG AAA (>7:1).
* **Visible Focus Indicators**: High-visibility 3px amber focus rings (`--focus-ring: #c46800`) with 3px offset applied uniformly via `:focus-visible`.
* **Native `<dialog>` Modals**: HTML5 native dialogs featuring accessible labels (`aria-labelledby`), backdrop blurs, keyboard <kbd>Escape</kbd> dismissal, focus containment, and focus restoration to the trigger element upon closing.
* **Accessible Form Design**: Explicit `<label for="...">` associations, helper descriptions linked via `aria-describedby`, error summary alert container (`role="alert"`), and polite live announcements (`aria-live="polite"`).
* **Zero Unnecessary ARIA**: Strict adherence to the First Rule of ARIA — native semantic elements (`<button>`, `<table>`, `<input>`, `<dialog>`) are leveraged rather than custom pseudo-widgets.

### Data & State Management
* **Baseline Preservation**: 100% preservation of all 5 original audit findings (WEB-001 through WEB-005) and baseline audit data.
* **Dynamic LocalStorage Sync**: New findings added via `add-finding.html` immediately persist, update badge counters, reflect in the findings table, and appear in dynamically generated CSV exports.
* **Export Capabilities**: Download the baseline `accessibility-audit-template.csv` or dynamically export the live register as a compliant RFC-4180 CSV file.

---

## 3. Technologies Used

* **Semantic HTML5**: Native semantic elements, document landmarks, table captions, fieldsets, legends, and HTML5 `<dialog>`.
* **Modern CSS3**: CSS custom properties (design tokens), CSS Grid, Flexbox, high-contrast focus rings, and media queries (`prefers-reduced-motion`, responsive breakpoints).
* **Vanilla JavaScript (ES6+)**: Zero external dependencies; lightweight, modular DOM controllers, search/filter algorithms, and LocalStorage data layer.
* **Google Chrome DevTools Lighthouse & axe-core**: Automated accessibility evaluation engine.
* **Official W3C Nu HTML Checker**: Direct API validation ensuring 100% syntax compliance across all pages.

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
├── style.css                            # Unified enterprise stylesheet & design tokens
├── script.js                            # Modular application controller & data store
├── accessibility-audit-template.csv     # Baseline audit findings template (CSV)
├── README.md                            # Comprehensive project documentation
│
├── screenshots/                         # Visual audit evidence artifacts
│   ├── accessibility-dashboard-overview.png
│   ├── lighthouse-accessibility-issues.png
│   └── lighthouse-accessibility-score.png
│
├── validate-pages.js                    # W3C Nu HTML Checker verification script
└── test-suite.js                        # Automated unit & integration test runner (139 tests)
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

#### Method B: Local Development Server (Recommended)
Using Python:
```bash
# Python 3
python -m http.server 8000
```
Using Node.js (`npx serve` or `http-server`):
```bash
npx serve .
```
Then visit `http://localhost:8000` or the indicated port in your browser.

---

## 6. How to Run the Test Suite & W3C HTML Validation

### 1. Run the Comprehensive Automated Test Suite (139 Tests)
The project includes an automated test runner (`test-suite.js`) verifying link integrity, semantic landmarks, single-`<h1>` constraints, table structures, form associations, modal handlers, and data preservation:
```bash
node test-suite.js
```
Expected output:
```
====================================================
 TEST SUMMARY: Total: 139 | Passed: 139 | Failed: 0
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
  * [x] Text color contrast meets minimum 4.5:1 ratio (WCAG 1.4.3).
  * [x] Information and relationships conveyable via semantic markup (WCAG 1.3.1).
  * [x] Non-text content has descriptive text alternatives (WCAG 1.1.1).
* [x] **WCAG 2.1 Principle 2: Operable**
  * [x] Fully navigable via keyboard (<kbd>Tab</kbd>, <kbd>Shift+Tab</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Esc</kbd>) (WCAG 2.1.1).
  * [x] Visible focus indicators on all interactive controls (WCAG 2.4.7).
  * [x] Skip-to-main-content bypass mechanism implemented on all pages (WCAG 2.4.1).
  * [x] No keyboard trap; dialogs contain and restore focus cleanly (WCAG 2.1.2).
* [x] **WCAG 2.1 Principle 3: Understandable**
  * [x] Default language specified via `<html lang="en">` (WCAG 3.1.1).
  * [x] Form inputs have explicit `<label for="...">` associations (WCAG 3.3.2).
  * [x] Accessible error summary container with `role="alert"` (WCAG 3.3.1 / 3.3.3).
* [x] **WCAG 2.1 Principle 4: Robust**
  * [x] Fully valid HTML5 verified against official W3C Nu HTML Checker (WCAG 4.1.1).
  * [x] Dynamic updates announced politely using `aria-live="polite"` (WCAG 4.1.3).

---

## 9. Academic Disclaimer

This project was developed by RabTech Academy Interns for **Task 03: Semantic HTML5 & Accessible Component Architecture**. All audit findings represent recorded baseline observations for instructional and remediation design purposes. No modification or formal certification of the live National Portal of India website is implied.
