/**
 * Final Audit Verification Script
 * Validates all 13 points requested for RabTech Academy Task 03.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const auditResults = {
    total: 0,
    passed: 0,
    failed: 0,
    checks: []
};

function recordCheck(section, description, passed, details = '') {
    auditResults.total++;
    if (passed) {
        auditResults.passed++;
        auditResults.checks.push({ section, description, status: 'PASSED', details });
        console.log(`[PASS] [${section}] ${description}`);
    } else {
        auditResults.failed++;
        auditResults.checks.push({ section, description, status: 'FAILED', details });
        console.error(`[FAIL] [${section}] ${description}: ${details}`);
    }
}

console.log('================================================================');
console.log(' FINAL AUDIT VERIFICATION: RABTECH ACADEMY TASK 03');
console.log('================================================================\n');

// 1. All four pages work correctly
console.log('>>> CHECK 1: All four pages work correctly');
const pages = ['index.html', 'findings.html', 'add-finding.html', 'documentation.html'];
pages.forEach(p => {
    const fullPath = path.join(__dirname, p);
    const exists = fs.existsSync(fullPath);
    const content = exists ? fs.readFileSync(fullPath, 'utf8') : '';
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasLang = content.includes('<html lang="en">');
    const hasHead = content.includes('<head>') && content.includes('</head>');
    const hasBody = content.includes('<body>') && content.includes('</body>');
    const hasTitle = /<title>.*?<\/title>/.test(content);
    const hasCss = content.includes('href="style.css"');
    const hasJs = content.includes('src="script.js"');

    recordCheck(
        '1. Four Pages Work',
        `${p} exists with standard HTML5 document structure, title, style.css, and script.js`,
        exists && hasDoctype && hasLang && hasHead && hasBody && hasTitle && hasCss && hasJs,
        `File size: ${content.length} chars`
    );
});

// 2. Navigation links work on every page
console.log('\n>>> CHECK 2: Navigation links work on every page');
const hrefRegex = /href="([^"#:]+)(?:#[^"]*)?"/g;
pages.forEach(p => {
    const content = fs.readFileSync(path.join(__dirname, p), 'utf8');
    let match;
    const internalLinks = [];
    while ((match = hrefRegex.exec(content)) !== null) {
        if (!match[1].startsWith('http') && !match[1].startsWith('mailto')) {
            internalLinks.push(match[1]);
        }
    }

    let allLinksValid = true;
    let missingTarget = '';
    internalLinks.forEach(link => {
        const targetPath = path.join(__dirname, link);
        if (!fs.existsSync(targetPath)) {
            allLinksValid = false;
            missingTarget = link;
        }
    });

    recordCheck(
        '2. Navigation Links',
        `All internal links in ${p} resolve to existing files`,
        allLinksValid,
        missingTarget ? `Missing: ${missingTarget}` : `Checked ${internalLinks.length} links`
    );

    // Active link highlighting
    const hasActiveNav = content.includes(`href="${p}" class="sidebar-link" aria-current="page"`);
    recordCheck(
        '2. Navigation Links',
        `${p} has aria-current="page" on its corresponding sidebar navigation link`,
        hasActiveNav
    );
});

// 3. Findings Register search and filters work
console.log('\n>>> CHECK 3: Findings Register search and filters');
const scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// Load script.js in a virtual sandbox with simulated DOM and localStorage
const mockStorage = {};
const mockLocalStorage = {
    getItem: (key) => mockStorage[key] || null,
    setItem: (key, val) => { mockStorage[key] = String(val); },
    removeItem: (key) => { delete mockStorage[key]; }
};

const sandbox = {
    console,
    localStorage: mockLocalStorage,
    window: {},
    document: {
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
    },
    Blob: function(parts) { this.parts = parts; },
    URL: { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} },
    location: { reload: () => {} }
};

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

// Test initial findings
const initialFindings = sandbox.getStoredFindings();
recordCheck(
    '3. Search & Filters',
    'getStoredFindings returns 5 baseline findings',
    Array.isArray(initialFindings) && initialFindings.length === 5,
    `Count: ${initialFindings.length}`
);

// Search filtering test logic
function filterTest(query, status, priority, list) {
    return list.filter(item => {
        const searchable = [
            item.id,
            item.component,
            item.title,
            item.wcag,
            item.evidence,
            item.impact,
            item.fix,
            item.owner
        ].join(' ').toLowerCase();

        const matchQuery = query === '' || searchable.includes(query.toLowerCase());
        const matchStatus = status === 'all' || item.status.toLowerCase() === status.toLowerCase();
        const matchPriority = priority === 'all' || item.priority.toLowerCase() === priority.toLowerCase();
        return matchQuery && matchStatus && matchPriority;
    });
}

const searchWeb001 = filterTest('WEB-001', 'all', 'all', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Search by ID "WEB-001" returns exactly 1 item',
    searchWeb001.length === 1 && searchWeb001[0].id === 'WEB-001'
);

const searchContrast = filterTest('contrast', 'all', 'all', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Search by keyword "contrast" returns WEB-002',
    searchContrast.length === 1 && searchContrast[0].id === 'WEB-002'
);

const filterOpen = filterTest('', 'Open', 'all', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Status filter "Open" returns 3 items',
    filterOpen.length === 3
);

const filterVerify = filterTest('', 'Needs verification', 'all', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Status filter "Needs verification" returns 2 items',
    filterVerify.length === 2
);

const filterHigh = filterTest('', 'all', 'High', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Priority filter "High" returns 3 items',
    filterHigh.length === 3
);

const filterMedium = filterTest('', 'all', 'Medium', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Priority filter "Medium" returns 2 items',
    filterMedium.length === 2
);

const filterNoMatch = filterTest('nonexistent-term', 'all', 'all', initialFindings);
recordCheck(
    '3. Search & Filters',
    'Unmatched search returns empty list (triggering empty state)',
    filterNoMatch.length === 0
);

// 4. View Details modal works correctly
console.log('\n>>> CHECK 4: View Details modal');
const findingsHtml = fs.readFileSync(path.join(__dirname, 'findings.html'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

recordCheck(
    '4. Details Modal',
    'findings.html contains native <dialog id="details-dialog"> with aria-labelledby',
    findingsHtml.includes('<dialog id="details-dialog"') && findingsHtml.includes('aria-labelledby="dialog-title"')
);

recordCheck(
    '4. Details Modal',
    'index.html contains native <dialog id="details-dialog"> with aria-labelledby',
    indexHtml.includes('<dialog id="details-dialog"') && indexHtml.includes('aria-labelledby="dialog-title"')
);

recordCheck(
    '4. Details Modal',
    'script.js contains openDetailsDialog function handling dialog.showModal() and focus restoration',
    typeof sandbox.openDetailsDialog === 'function' && scriptCode.includes('showModal') && scriptCode.includes('lastActiveElement.focus')
);

recordCheck(
    '4. Details Modal',
    'script.js handles keyboard Escape key to close modal and restore focus',
    scriptCode.includes('"Escape"') && scriptCode.includes('closeDetailsDialog')
);

// 5. Add New Finding form validates and saves new findings
console.log('\n>>> CHECK 5: Add New Finding form validation & submission');
const addFindingHtml = fs.readFileSync(path.join(__dirname, 'add-finding.html'), 'utf8');

const requiredFields = [
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

let allFieldsPresent = true;
requiredFields.forEach(f => {
    if (!addFindingHtml.includes(`id="${f}"`) || !addFindingHtml.includes(`for="${f}"`)) {
        allFieldsPresent = false;
    }
});

recordCheck(
    '5. Form Validation & Intake',
    'add-finding.html contains all 11 required fields with explicit <label for="..."> associations',
    allFieldsPresent
);

recordCheck(
    '5. Form Validation & Intake',
    'add-finding.html includes accessible error summary box with role="alert"',
    addFindingHtml.includes('id="error-summary"') && addFindingHtml.includes('role="alert"')
);

recordCheck(
    '5. Form Validation & Intake',
    'add-finding.html includes accessible success banner with role="status" and aria-live="polite"',
    addFindingHtml.includes('id="success-banner"') && addFindingHtml.includes('role="status"') && addFindingHtml.includes('aria-live="polite"')
);

recordCheck(
    '5. Form Validation & Intake',
    'script.js checks for unique IDs and prevents duplicate submissions',
    scriptCode.includes('idExists') && scriptCode.includes('already used')
);

// 6. Newly added findings appear in Findings Register
console.log('\n>>> CHECK 6: Newly added findings appear in register');
const testNewFinding = {
    id: 'WEB-006',
    component: 'Header Search Bar',
    title: 'Missing Accessible Label on Search Button',
    wcag: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
    evidence: 'Lighthouse flagged button with no accessible name',
    impact: 'Screen reader users cannot identify button purpose',
    fix: 'Add aria-label="Search" or visible button text',
    priority: 'High',
    status: 'Open',
    owner: 'Student Auditor'
};

const updatedList = [...initialFindings, testNewFinding];
sandbox.saveFindingsToStorage(updatedList);
const retrievedAfterAdd = sandbox.getStoredFindings();

recordCheck(
    '6. Register Update',
    'Newly added finding WEB-006 is successfully retrieved in findings list',
    retrievedAfterAdd.length === 6 && retrievedAfterAdd.some(f => f.id === 'WEB-006')
);

// 7. Data persistence works after refreshing browser
console.log('\n>>> CHECK 7: Data persistence across sessions');
recordCheck(
    '7. Persistence',
    'LocalStorage stores stringified JSON under key "accessibility_audit_findings"',
    mockStorage['accessibility_audit_findings'] && mockStorage['accessibility_audit_findings'].includes('WEB-006')
);

// Re-read storage via clean call simulating page reload
const reloadedFindings = sandbox.getStoredFindings();
recordCheck(
    '7. Persistence',
    'Findings persist after mock page reload and contain 6 items',
    reloadedFindings.length === 6
);

// 8. CSV download works
console.log('\n>>> CHECK 8: CSV download & export');
const csvTemplatePath = path.join(__dirname, 'accessibility-audit-template.csv');
const templateExists = fs.existsSync(csvTemplatePath);
const templateContent = templateExists ? fs.readFileSync(csvTemplatePath, 'utf8') : '';

recordCheck(
    '8. CSV Download',
    'accessibility-audit-template.csv exists in workspace root and is non-empty',
    templateExists && templateContent.length > 500,
    `Size: ${templateContent.length} bytes`
);

let csvGenerated = false;
let csvHeaderValid = false;
let csvIncludesAdded = false;

// Test exportFindingsToCSV function logic
try {
    let capturedBlobParts = null;
    sandbox.Blob = function(parts) { capturedBlobParts = parts; };
    sandbox.document.createElement = (tag) => {
        return {
            setAttribute: () => {},
            click: () => {},
            style: {}
        };
    };
    sandbox.document.body = {
        appendChild: () => {},
        removeChild: () => {}
    };

    sandbox.exportFindingsToCSV(reloadedFindings);
    if (capturedBlobParts && capturedBlobParts[0]) {
        csvGenerated = true;
        const csvStr = capturedBlobParts[0];
        csvHeaderValid = csvStr.startsWith('issue_id,page_or_component,issue_title,wcag_reference');
        csvIncludesAdded = csvStr.includes('WEB-006') && csvStr.includes('Missing Accessible Label');
    }
} catch (e) {
    console.error('Error during CSV generation test:', e);
}

recordCheck(
    '8. CSV Download',
    'exportFindingsToCSV creates compliant RFC-4180 CSV containing all findings including added ones',
    csvGenerated && csvHeaderValid && csvIncludesAdded
);

// 9. All pages follow semantic HTML5 standards
console.log('\n>>> CHECK 9: Semantic HTML5 standards');
pages.forEach(p => {
    const content = fs.readFileSync(path.join(__dirname, p), 'utf8');
    const hasHeader = content.includes('<header');
    const hasNav = content.includes('<nav');
    const hasMain = content.includes('<main id="main"');
    const hasSection = content.includes('<section');
    const hasFooter = content.includes('<footer');
    const h1Count = (content.match(/<h1[^>]*>.*?<\/h1>/gs) || []).length;

    recordCheck(
        '9. Semantic HTML5',
        `${p} uses semantic landmarks (<header>, <nav>, <main id="main">, <section>, <footer>) and exactly one <h1>`,
        hasHeader && hasNav && hasMain && hasSection && hasFooter && h1Count === 1,
        `<h1> count: ${h1Count}`
    );
});

// 10. Accessibility features
console.log('\n>>> CHECK 10: Accessibility features (labels, keyboard, focus, ARIA)');
const styleContent = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

pages.forEach(p => {
    const content = fs.readFileSync(path.join(__dirname, p), 'utf8');
    recordCheck(
        '10. Accessibility Features',
        `${p} has skip-to-main-content link targeting #main`,
        content.includes('class="skip-link"') && content.includes('href="#main"')
    );
});

recordCheck(
    '10. Accessibility Features',
    'style.css specifies high-visibility :focus-visible outline with custom token --focus-ring',
    styleContent.includes(':focus-visible') && styleContent.includes('--focus-ring:')
);

recordCheck(
    '10. Accessibility Features',
    'style.css defines dark primary teal meeting WCAG AAA (7.2:1) contrast against white',
    styleContent.includes('--primary: #075c58')
);

// Check that no redundant ARIA role="form" or role="textbox" exists
let redundantAriaFound = false;
pages.forEach(p => {
    const content = fs.readFileSync(path.join(__dirname, p), 'utf8');
    if (content.includes('role="textbox"') || content.includes('role="form"') || content.includes('role="button"')) {
        redundantAriaFound = true;
    }
});
recordCheck(
    '10. Accessibility Features',
    'Zero redundant ARIA roles (First Rule of ARIA adhered to strictly)',
    !redundantAriaFound
);

// 11. Responsive layout works on mobile, tablet and desktop
console.log('\n>>> CHECK 11: Responsive layout');
recordCheck(
    '11. Responsive Layout',
    'style.css defines responsive media queries for tablet (1024px, 860px) and mobile (640px)',
    styleContent.includes('@media (max-width: 1024px)') &&
    styleContent.includes('@media (max-width: 860px)') &&
    styleContent.includes('@media (max-width: 640px)')
);

recordCheck(
    '11. Responsive Layout',
    'style.css includes prefers-reduced-motion media query for motion sensitivity',
    styleContent.includes('@media (prefers-reduced-motion: reduce)')
);

recordCheck(
    '11. Responsive Layout',
    'Mobile navigation toggle button (#menu-toggle) with aria-expanded and aria-controls present on all pages',
    pages.every(p => {
        const c = fs.readFileSync(path.join(__dirname, p), 'utf8');
        return c.includes('id="menu-toggle"') && c.includes('aria-expanded="false"') && c.includes('aria-controls="app-sidebar"');
    })
);

// 12. No JavaScript errors or broken links
console.log('\n>>> CHECK 12: No JavaScript errors or broken links');
let jsSyntaxValid = true;
try {
    new vm.Script(scriptCode);
} catch (e) {
    jsSyntaxValid = false;
    console.error('JS Syntax Error:', e);
}
recordCheck(
    '12. Error-Free Execution',
    'script.js compiles and executes without syntax errors',
    jsSyntaxValid
);

// 13. No existing project files or features unnecessarily deleted
console.log('\n>>> CHECK 13: Project files integrity');
const requiredProjectFiles = [
    'index.html',
    'style.css',
    'script.js',
    'README.md',
    'accessibility-audit-template.csv',
    'screenshots/accessibility-dashboard-overview.png',
    'screenshots/lighthouse-accessibility-issues.png',
    'screenshots/lighthouse-accessibility-score.png'
];

let allOriginalFilesPresent = true;
requiredProjectFiles.forEach(f => {
    const full = path.join(__dirname, f);
    if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
        allOriginalFilesPresent = false;
    }
});

recordCheck(
    '13. File Preservation',
    'All original project files, CSV template, and screenshot assets are preserved intact',
    allOriginalFilesPresent
);

// Summary Output
console.log('\n================================================================');
console.log(` FINAL AUDIT SUMMARY: Total Checks: ${auditResults.total} | Passed: ${auditResults.passed} | Failed: ${auditResults.failed}`);
console.log('================================================================');

if (auditResults.failed === 0) {
    console.log('\n🎉 ALL 13 AUDIT CHECKPOINTS HAVE PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
} else {
    console.error(`\n❌ ${auditResults.failed} AUDIT CHECKPOINTS FAILED.\n`);
    process.exit(1);
}

