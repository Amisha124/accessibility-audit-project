/**
 * Comprehensive Automated Test Suite
 * Tests multi-page architecture, semantic HTML5, navigation links,
 * accessible forms, modal dialogs, data integrity, and JavaScript controllers.
 */

const fs = require('fs');
const path = require('path');

const PAGES = ['index.html', 'findings.html', 'add-finding.html', 'documentation.html'];
const ASSETS = [
    'style.css',
    'script.js',
    'README.md',
    'accessibility-audit-template.csv',
    'screenshots/accessibility-dashboard-overview.png',
    'screenshots/lighthouse-accessibility-issues.png',
    'screenshots/lighthouse-accessibility-score.png'
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

// TEST SUITE 5: Preserved Data & JavaScript Logic
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

// TEST SUITE 6: Styling, Design Tokens & Contrast (style.css)
console.log('\n--- TEST SUITE 6: CSS Design Tokens, Contrast & Responsiveness ---');
const styleContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

assert(styleContent.includes(':focus-visible'), 'style.css specifies :focus-visible indicators for accessible keyboard navigation');
assert(styleContent.includes('--focus-ring:'), 'style.css defines custom focus ring token');
assert(styleContent.includes('--primary:'), 'style.css defines primary brand token');
assert(styleContent.includes('@media (max-width:'), 'style.css includes responsive breakpoints for tablet and mobile');
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

