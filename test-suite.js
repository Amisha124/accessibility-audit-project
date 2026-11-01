/**
 * Comprehensive Automated Test Suite
 * Tests multi-page architecture, semantic HTML5, navigation links,
 * accessible forms, modal dialogs, data integrity, JavaScript controllers,
 * mobile-first design tokens, theme switching, and responsive breakpoints.
 */

const fs = require('fs');
const path = require('path');

const PAGES = ['index.html', 'findings.html', 'add-finding.html', 'documentation.html'];
const ASSETS = [
    'style.css',
    'script.js',
    'README.md',
    'accessibility-audit-template.csv',
    // Original screenshots
    'screenshots/accessibility-dashboard-overview.png',
    'screenshots/lighthouse-accessibility-issues.png',
    'screenshots/lighthouse-accessibility-score.png',
    // Task 04 Responsive layout screenshots
    'screenshots/responsive-mobile-320px.png',
    'screenshots/responsive-tablet-768px.png',
    'screenshots/responsive-desktop-1024px.png',
    'screenshots/responsive-wide-1440px.png',
    // Task 04 Theme screenshots
    'screenshots/theme-dark-mode-dashboard.png',
    'screenshots/theme-light-mode-dashboard.png'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✓ PASS: ${message}`);
    } else {
        failedTests++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

console.log('====================================================');
console.log(' ACCESSIBILITY AUDIT DASHBOARD - TEST SUITE RUNNER  ');
console.log(' Task 04: Design Tokens & Mobile-First Architecture ');
console.log('====================================================\n');

// TEST SUITE 1: Required Files & Asset Existence
console.log('--- TEST SUITE 1: Required Files & Asset Integrity ---');
[...PAGES, ...ASSETS].forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    const exists = fs.existsSync(fullPath);
    const size = exists ? fs.statSync(fullPath).size : 0;
    assert(exists && size > 0, `File exists and is non-empty: ${filePath} (${size} bytes)`);
});

// TEST SUITE 2: Multi-Page Navigation & Internal Link Integrity
console.log('\n--- TEST SUITE 2: Multi-Page Architecture & Link Integrity ---');
const hrefRegex = /href="([^"#]+)(?:#[^"]*)?"/g;

PAGES.forEach(page => {
    const content = fs.readFileSync(path.join(__dirname, page), 'utf8');

    // Skip to main content link
    assert(
        content.includes('href="#main"') && content.includes('class="skip-link"'),
        `[${page}] Contains functional Skip-to-Main link targeting #main`
    );

    // Target #main element exists
    assert(
        content.includes('id="main"') && content.includes('<main'),
        `[${page}] Contains <main id="main"> target landmark`
    );

    // Sidebar navigation landmark
    assert(
        content.includes('<aside') && content.includes('id="app-sidebar"'),
        `[${page}] Contains <aside id="app-sidebar"> navigation landmark`
    );

    // Theme toggle button exists
    assert(
        content.includes('id="theme-toggle"') && content.includes('class="theme-toggle"'),
        `[${page}] Contains accessible theme toggle button (#theme-toggle)`
    );

    // Check all internal navigation links point to existing files
    let match;
    const internalHrefs = [];
    const localHrefRegex = /href="([^"#:]+\.(html|css|js|csv))"/g;
    while ((match = localHrefRegex.exec(content)) !== null) {
        internalHrefs.push(match[1]);
    }

    internalHrefs.forEach(target => {
        const targetPath = path.join(__dirname, target);
        assert(fs.existsSync(targetPath), `[${page}] Link target exists: href="${target}"`);
    });

    // Check active navigation indicator aria-current="page"
    assert(
        content.includes(`href="${page}" class="sidebar-link" aria-current="page"`) ||
        content.includes(`href="${page}" class="sidebar-link active" aria-current="page"`),
        `[${page}] Current page is highlighted with aria-current="page"`
    );
});

// TEST SUITE 3: Semantic HTML5 Structure & Heading Hierarchy
console.log('\n--- TEST SUITE 3: Semantic HTML5 & Heading Hierarchy ---');
PAGES.forEach(page => {
    const content = fs.readFileSync(path.join(__dirname, page), 'utf8');

    // Required landmarks
    assert(content.includes('<header'), `[${page}] Has <header> landmark`);
    assert(content.includes('<nav'), `[${page}] Has <nav> landmark`);
    assert(content.includes('<main'), `[${page}] Has <main> landmark`);
    assert(content.includes('<section'), `[${page}] Has <section> landmark`);
    assert(content.includes('<footer'), `[${page}] Has <footer> landmark`);

    // Exactly one h1 per page
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gs) || [];
    assert(h1Matches.length === 1, `[${page}] Has exactly one <h1> element (found: ${h1Matches.length})`);

    // Table semantics (on pages with tables)
    if (content.includes('<table')) {
        assert(content.includes('<caption'), `[${page}] Table contains <caption> element`);
        assert(content.includes('<thead') && content.includes('<tbody'), `[${page}] Table contains <thead> and <tbody>`);
        assert(content.includes('scope="col"'), `[${page}] Table column headers specify scope="col"`);
    }
});

// TEST SUITE 4: Accessible Forms (add-finding.html)
console.log('\n--- TEST SUITE 4: Accessible Form Controls (add-finding.html) ---');
const addFindingHtml = fs.readFileSync(path.join(__dirname, 'add-finding.html'), 'utf8');

const requiredFormFields = [
    'finding-id',
    'component-name',
    'finding-title',
    'wcag-reference',
    'issue-description',
    'audit-evidence',
    'user-impact',
    'recommended-fix',
    'finding-priority',
    'finding-status',
    'finding-owner'
];

requiredFormFields.forEach(fieldId => {
    // Check input or select exists with this id
    const inputExists = addFindingHtml.includes(`id="${fieldId}"`);
    // Check explicit label for this id
    const labelExists = addFindingHtml.includes(`for="${fieldId}"`);
    assert(inputExists && labelExists, `Form field #${fieldId} exists with associated <label for="${fieldId}">`);
});

// Form fieldsets & legends
const fieldsetCount = (addFindingHtml.match(/<fieldset/g) || []).length;
const legendCount = (addFindingHtml.match(/<legend/g) || []).length;
assert(fieldsetCount >= 3 && legendCount >= 3, `Form groups controls into at least 3 semantic fieldsets with legends (found: ${fieldsetCount})`);

// Form accessibility notifications
assert(addFindingHtml.includes('id="error-summary"') && addFindingHtml.includes('role="alert"'), 'Form includes error summary container with role="alert"');
assert(addFindingHtml.includes('id="success-banner"') && addFindingHtml.includes('role="status"'), 'Form includes live success banner with role="status"');

// TEST SUITE 5: Preserved Data & JavaScript Controllers
console.log('\n--- TEST SUITE 5: Baseline Data Preservation & JS Controller ---');
const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Verify 5 baseline findings exist in script.js
const baselineIds = ['WEB-001', 'WEB-002', 'WEB-003', 'WEB-004', 'WEB-005'];
baselineIds.forEach(id => {
    assert(scriptContent.includes(`id: "${id}"`), `script.js preserves baseline finding ${id}`);
});

// Verify Lighthouse score 86 is preserved
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
assert(indexHtml.includes('86') && indexHtml.includes('score-display'), 'index.html displays the baseline Lighthouse score of 86/100');
assert(indexHtml.includes('India.gov.in') || indexHtml.includes('india.gov.in'), 'index.html maintains audit target reference to India.gov.in');

// CSV export capability
assert(scriptContent.includes('exportFindingsToCSV'), 'script.js implements exportFindingsToCSV function');

// Dialog modal focus & escape support
assert(scriptContent.includes('openDetailsDialog') && scriptContent.includes('closeDetailsDialog'), 'script.js implements modal management');
assert(scriptContent.includes('"Escape"'), 'script.js handles keyboard Escape key to close dialog and drawer');

// Theme controller in script.js
assert(scriptContent.includes('initTheme'), 'script.js implements initTheme function');
assert(scriptContent.includes('data-theme'), 'script.js sets data-theme attribute on documentElement');
assert(scriptContent.includes('THEME_STORAGE_KEY'), 'script.js synchronizes theme with localStorage');

// TEST SUITE 6: Mobile-First CSS, Design Tokens & Responsive Architecture
console.log('\n--- TEST SUITE 6: Design Tokens & Mobile-First CSS Architecture ---');
const styleContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

// Design Tokens
assert(styleContent.includes(':root {'), 'style.css defines :root design tokens');
assert(styleContent.includes('--primary:'), 'style.css defines --primary color token');
assert(styleContent.includes('--bg-canvas:'), 'style.css defines --bg-canvas background token');
assert(styleContent.includes('--bg-surface:'), 'style.css defines --bg-surface token');
assert(styleContent.includes('--space-1:') && styleContent.includes('--space-16:'), 'style.css defines comprehensive spacing tokens (--space-1 to --space-16)');
assert(styleContent.includes('--radius-sm:') && styleContent.includes('--radius-lg:'), 'style.css defines border radius tokens');
assert(styleContent.includes('--shadow-sm:') && styleContent.includes('--shadow-lg:'), 'style.css defines shadow elevation tokens');
assert(styleContent.includes('--transition-fast:'), 'style.css defines transition tokens');

// Dark Theme Tokens
assert(styleContent.includes('[data-theme="dark"]'), 'style.css implements [data-theme="dark"] theme selector');

// Mobile-First Breakpoints
assert(styleContent.includes('@media (min-width: 480px)'), 'style.css defines mobile-first breakpoint at min-width: 480px');
assert(styleContent.includes('@media (min-width: 768px)'), 'style.css defines mobile-first breakpoint at min-width: 768px (Tablet)');
assert(styleContent.includes('@media (min-width: 1024px)'), 'style.css defines mobile-first breakpoint at min-width: 1024px (Desktop)');
assert(styleContent.includes('@media (min-width: 1440px)'), 'style.css defines mobile-first breakpoint at min-width: 1440px (Wide Desktop)');

// Accessibility & Touch Target Styling
assert(styleContent.includes(':focus-visible'), 'style.css specifies :focus-visible indicators for accessible keyboard navigation');
assert(styleContent.includes('--focus-ring:'), 'style.css defines custom focus ring token');
assert(styleContent.includes('min-height: 44px') || styleContent.includes('min-height: 42px'), 'style.css specifies touch-friendly min-height for interactive controls');
assert(styleContent.includes('prefers-reduced-motion'), 'style.css respects prefers-reduced-motion media query');
assert(styleContent.includes('dialog.details-modal'), 'style.css styles native HTML5 <dialog> modal');

// SUMMARY
console.log('\n====================================================');
console.log(` TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
    process.exit(1);
} else {
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!\n');
}
