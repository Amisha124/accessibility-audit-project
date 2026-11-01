/**
 * Automated Verification Suite for Task 05:
 * Dynamic JavaScript DOM Logic & RESTful API Client
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log(' RABTECH ACADEMY TASK 05: TEST SUITE VERIFICATION  ');
console.log(' Dynamic JavaScript DOM Logic & RESTful API Client ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ PASS: ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(`    -> ${err.message}`);
        failCount++;
    }
}

// ---------------------------------------------------------
// TEST SUITE 1: File Existence & Modular Architecture
// ---------------------------------------------------------
console.log('--- TEST SUITE 1: Modular JS Architecture & File Structure ---');

test('api.js exists and is non-empty', () => {
    const stats = fs.statSync(path.join(__dirname, 'api.js'));
    assert(stats.size > 2000, `api.js size is ${stats.size} bytes`);
});

test('app.js exists and is non-empty', () => {
    const stats = fs.statSync(path.join(__dirname, 'app.js'));
    assert(stats.size > 5000, `app.js size is ${stats.size} bytes`);
});

test('All four HTML pages load api.js and app.js', () => {
    const pages = ['index.html', 'findings.html', 'add-finding.html', 'documentation.html'];
    pages.forEach(p => {
        const content = fs.readFileSync(path.join(__dirname, p), 'utf8');
        assert(content.includes('src="api.js"'), `${p} includes api.js`);
        assert(content.includes('src="app.js"'), `${p} includes app.js`);
    });
});

// ---------------------------------------------------------
// TEST SUITE 2: ApiClient REST API & Caching Logic
// ---------------------------------------------------------
console.log('\n--- TEST SUITE 2: RESTful API Client & Caching Logic ---');

const ApiClient = require('./api.js');

test('ApiClient exports required public interface methods', () => {
    assert(typeof ApiClient.fetchRepoDetails === 'function', 'fetchRepoDetails is exported');
    assert(typeof ApiClient.fetchRecentCommits === 'function', 'fetchRecentCommits is exported');
    assert(typeof ApiClient.inferCommitCategory === 'function', 'inferCommitCategory is exported');
    assert(typeof ApiClient.savePreferences === 'function', 'savePreferences is exported');
    assert(typeof ApiClient.getStoredPreferences === 'function', 'getStoredPreferences is exported');
    assert(typeof ApiClient.clearCache === 'function', 'clearCache is exported');
});

test('ApiClient.inferCommitCategory correctly infers commit categories', () => {
    assert.strictEqual(ApiClient.inferCommitCategory('feat: add dark mode toggle'), 'Features');
    assert.strictEqual(ApiClient.inferCommitCategory('Implemented responsive design tokens'), 'Features');
    assert.strictEqual(ApiClient.inferCommitCategory('fix: correct touch target contrast bug'), 'Fixes');
    assert.strictEqual(ApiClient.inferCommitCategory('Resolved missing aria attributes'), 'Fixes');
    assert.strictEqual(ApiClient.inferCommitCategory('Update README.md with audit documentation'), 'Documentation');
    assert.strictEqual(ApiClient.inferCommitCategory('docs: add WCAG guide and screenshots'), 'Documentation');
    assert.strictEqual(ApiClient.inferCommitCategory('Initial commit / chore setup'), 'Other');
});

// Mock LocalStorage environment for Node testing
const mockStorage = {};
global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

test('ApiClient saves and restores search/filter preferences', () => {
    ApiClient.savePreferences({ search: 'contrast', category: 'Fixes', sort: 'oldest' });
    const restored = ApiClient.getStoredPreferences();
    assert.strictEqual(restored.search, 'contrast');
    assert.strictEqual(restored.category, 'Fixes');
    assert.strictEqual(restored.sort, 'oldest');
});

// ---------------------------------------------------------
// TEST SUITE 3: Dynamic DOM Elements in index.html
// ---------------------------------------------------------
console.log('\n--- TEST SUITE 3: Live Repository Activity DOM Structure ---');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

test('index.html contains #repo-activity-section panel with accessible heading', () => {
    assert(indexHtml.includes('id="repo-activity-section"'), 'Contains #repo-activity-section');
    assert(indexHtml.includes('id="activity-heading"'), 'Contains #activity-heading');
    assert(indexHtml.includes('Live Repository Activity'), 'Heading text present');
});

test('index.html contains manual refresh button (#activity-refresh-btn)', () => {
    assert(indexHtml.includes('id="activity-refresh-btn"'), 'Contains #activity-refresh-btn');
    assert(indexHtml.includes('aria-label="Refresh live repository data from GitHub REST API"'), 'Refresh button has accessible name');
});

test('index.html contains inferred category explanation notice', () => {
    assert(indexHtml.includes('category-inference-notice'), 'Contains category-inference-notice container');
    assert(indexHtml.includes('Automated Heuristic Categorization:'), 'Explains heuristic category inference');
    assert(indexHtml.includes('features-pill') && indexHtml.includes('fixes-pill'), 'Sample badges present');
});

test('index.html contains live repository statistics container (#repo-live-stats)', () => {
    assert(indexHtml.includes('id="repo-live-stats"'), 'Contains #repo-live-stats container');
});

test('index.html contains activity search input with accessible label', () => {
    assert(indexHtml.includes('id="activity-search-input"'), 'Contains #activity-search-input');
    assert(indexHtml.includes('for="activity-search-input"'), 'Contains matching <label for="activity-search-input">');
});

test('index.html contains all 5 category filter tabs with role="tablist" & role="tab"', () => {
    assert(indexHtml.includes('role="tablist"'), 'Tablist container present');
    assert(indexHtml.includes('id="activity-tabs"'), 'Tabs container has #activity-tabs');
    assert(indexHtml.includes('data-category="All"'), 'Contains All category tab');
    assert(indexHtml.includes('data-category="Features"'), 'Contains Features category tab');
    assert(indexHtml.includes('data-category="Fixes"'), 'Contains Fixes category tab');
    assert(indexHtml.includes('data-category="Documentation"'), 'Contains Documentation category tab');
    assert(indexHtml.includes('data-category="Other"'), 'Contains Other category tab');
});

test('index.html contains sort dropdown with newest and oldest options', () => {
    assert(indexHtml.includes('id="activity-sort-select"'), 'Contains #activity-sort-select');
    assert(indexHtml.includes('value="newest"'), 'Contains newest option');
    assert(indexHtml.includes('value="oldest"'), 'Contains oldest option');
});

test('index.html contains screen-reader live announcements region and counter', () => {
    assert(indexHtml.includes('id="activity-live-status"'), 'Contains #activity-live-status');
    assert(indexHtml.includes('aria-live="polite"'), 'Live region specifies aria-live="polite"');
    assert(indexHtml.includes('id="activity-results-count"'), 'Contains #activity-results-count');
});

test('index.html contains #commits-list-container with role="tabpanel"', () => {
    assert(indexHtml.includes('id="commits-list-container"'), 'Contains #commits-list-container');
    assert(indexHtml.includes('role="tabpanel"'), 'Container has role="tabpanel"');
    assert(indexHtml.includes('tabindex="0"'), 'Container is keyboard focusable with tabindex="0"');
});

// ---------------------------------------------------------
// TEST SUITE 4: App Controller & Dynamic Features
// ---------------------------------------------------------
console.log('\n--- TEST SUITE 4: App Controller & ActivityController ---');

const app = require('./app.js');

test('app.js exports ActivityController', () => {
    assert(app.ActivityController, 'ActivityController is exported');
    assert(typeof app.ActivityController.init === 'function', 'ActivityController.init is a function');
    assert(typeof app.ActivityController.loadData === 'function', 'ActivityController.loadData is a function');
});

test('app.js preserves 5 baseline findings and storage helpers', () => {
    assert.strictEqual(app.INITIAL_FINDINGS.length, 5, 'Preserves exactly 5 baseline findings');
    assert(typeof app.getStoredFindings === 'function', 'getStoredFindings helper is preserved');
    assert(typeof app.saveFindingsToStorage === 'function', 'saveFindingsToStorage helper is preserved');
    assert(typeof app.exportFindingsToCSV === 'function', 'exportFindingsToCSV helper is preserved');
});

// ---------------------------------------------------------
// TEST SUITE 5: CSS Design Tokens & Activity Styles
// ---------------------------------------------------------
console.log('\n--- TEST SUITE 5: CSS Styles & Visual States ---');

const styleCss = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');

test('style.css defines live pulse dot animation', () => {
    assert(styleCss.includes('.live-pulse-dot'), 'Contains .live-pulse-dot class');
    assert(styleCss.includes('@keyframes pulse-green'), 'Contains @keyframes pulse-green');
});

test('style.css styles loading skeletons with shimmer animation', () => {
    assert(styleCss.includes('.activity-loading-skeleton'), 'Contains .activity-loading-skeleton');
    assert(styleCss.includes('.skeleton-card'), 'Contains .skeleton-card');
    assert(styleCss.includes('@keyframes skeleton-shimmer'), 'Contains @keyframes skeleton-shimmer');
});

test('style.css styles commit cards, avatars, and SHA badges', () => {
    assert(styleCss.includes('.commits-timeline'), 'Contains .commits-timeline');
    assert(styleCss.includes('.commit-card'), 'Contains .commit-card');
    assert(styleCss.includes('.commit-author-avatar'), 'Contains .commit-author-avatar');
    assert(styleCss.includes('.commit-sha-badge'), 'Contains .commit-sha-badge');
});

test('style.css styles category pills (features, fixes, docs, other)', () => {
    assert(styleCss.includes('.features-pill'), 'Contains .features-pill');
    assert(styleCss.includes('.fixes-pill'), 'Contains .fixes-pill');
    assert(styleCss.includes('.docs-pill'), 'Contains .docs-pill');
    assert(styleCss.includes('.other-pill'), 'Contains .other-pill');
});

test('style.css styles empty state and error recovery card', () => {
    assert(styleCss.includes('.activity-empty-state'), 'Contains .activity-empty-state');
    assert(styleCss.includes('.activity-error-card'), 'Contains .activity-error-card');
    assert(styleCss.includes('.activity-error-icon'), 'Contains .activity-error-icon');
});

test('style.css includes dark mode tokens and overrides for Task 05 components', () => {
    assert(styleCss.includes('[data-theme="dark"] .features-pill'), 'Dark mode features pill styled');
    assert(styleCss.includes('[data-theme="dark"] .skeleton-line'), 'Dark mode skeleton styled');
    assert(styleCss.includes('[data-theme="dark"] .activity-error-card'), 'Dark mode error card styled');
});

console.log('\n====================================================');
console.log(` TASK 05 TEST RESULTS: Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    console.log('\n🎉 ALL TASK 05 CHECKS PASSED WITH 100% SUCCESS!');
}

