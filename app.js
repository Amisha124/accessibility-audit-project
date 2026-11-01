/**
 * Main Application Logic & DOM Interaction Controller
 * Task: RabTech Academy Internship – Task 05
 * Topic: Dynamic JavaScript DOM Logic & RESTful API Client
 *
 * Coordinates UI components, Live Repository Activity, Findings Register,
 * Accessible Forms, Modal Dialogs, and Theme Management.
 */

"use strict";

if (typeof window !== "undefined") {
    window.__ACCESSIBILITY_APP_ACTIVE__ = true;
}

// Baseline accessibility findings from the Lighthouse audit of India.gov.in
const INITIAL_FINDINGS = [
    {
        id: "WEB-001",
        component: "Top Bar Service List",
        title: "ARIA Role Parent Relationship",
        wcag: "WCAG 2.1 - 1.3.1 Info and Relationships",
        priority: "High",
        status: "Open",
        evidence:
            "Lighthouse reported that a listitem role was not contained by its required parent element in the top bar service list.",
        impact:
            "Screen reader users may have difficulty understanding the structure of the service list.",
        fix:
            "Use semantic ul and li elements, or an appropriate valid ARIA list structure. Verify the accessibility tree after changes.",
        owner: "Student"
    },
    {
        id: "WEB-002",
        component: "Header Overlay Text",
        title: "Insufficient Color Contrast",
        wcag: "WCAG 2.1 - 1.4.3 Contrast (Minimum)",
        priority: "High",
        status: "Open",
        evidence:
            "Lighthouse reported insufficient contrast for the text 'Avail online Services & Save time'.",
        impact:
            "People with low vision may find the text difficult to read.",
        fix:
            "Adjust foreground or background colors to achieve a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.",
        owner: "Student"
    },
    {
        id: "WEB-003",
        component: "Website List Components",
        title: "List Items Missing a Valid Parent",
        wcag: "WCAG 2.1 - 1.3.1 Info and Relationships",
        priority: "High",
        status: "Open",
        evidence:
            "Lighthouse reported list items that were not contained within ul, ol, or menu parent elements.",
        impact:
            "Assistive technology may not correctly announce the list structure.",
        fix:
            "Place list items inside appropriate ul or ol elements and verify the resulting HTML structure.",
        owner: "Student"
    },
    {
        id: "WEB-004",
        component: "Interactive Controls",
        title: "Touch Target Size and Spacing",
        wcag: "WCAG 2.1 - 2.5.5 / Best Practice (Needs Verification)",
        priority: "Medium",
        status: "Needs verification",
        evidence:
            "Lighthouse reported a touch-target size or spacing concern. The specific controls require inspection.",
        impact:
            "Users may accidentally activate the wrong control, especially on touchscreens.",
        fix:
            "Inspect the flagged controls and improve their clickable area or spacing where necessary. Verify the applicable accessibility criterion.",
        owner: "Student"
    },
    {
        id: "WEB-005",
        component: "Repeated Links",
        title: "Identical Links Require Review",
        wcag: "WCAG 2.1 - 2.4.4 Link Purpose (In Context)",
        priority: "Medium",
        status: "Needs verification",
        evidence:
            "Lighthouse listed an identical-links-purpose best-practice audit requiring inspection.",
        impact:
            "Users may find it difficult to distinguish links that have the same accessible name but different destinations.",
        fix:
            "Inspect the flagged links and use descriptive link text when necessary.",
        owner: "Student"
    }
];

const STORAGE_KEY = "accessibility_audit_findings";
const THEME_STORAGE_KEY = "accessibility_audit_theme";

/**
 * Storage Helpers
 */
function getStoredFindings() {
    if (typeof localStorage === "undefined") return INITIAL_FINDINGS.slice();
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Storage access not available, defaulting to initial findings.", e);
    }
    return INITIAL_FINDINGS.slice();
}

function saveFindingsToStorage(findingsArray) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(findingsArray));
    } catch (e) {
        console.warn("Unable to save findings to localStorage.", e);
    }
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };
    return String(value).replace(/[&<>"']/g, function (char) {
        return entities[char];
    });
}

function formatDate(isoString) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (e) {
        return String(isoString);
    }
}

/**
 * CSV Export Utility
 */
function exportFindingsToCSV(findingsList) {
    const headers = [
        "issue_id",
        "page_or_component",
        "issue_title",
        "wcag_reference",
        "evidence",
        "priority",
        "user_impact",
        "recommended_fix",
        "owner",
        "status"
    ];

    function escapeCSVField(str) {
        const stringified = String(str || "");
        if (stringified.includes(",") || stringified.includes('"') || stringified.includes("\n")) {
            return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
    }

    const rows = findingsList.map(function (f) {
        return [
            escapeCSVField(f.id),
            escapeCSVField(f.component),
            escapeCSVField(f.title),
            escapeCSVField(f.wcag),
            escapeCSVField(f.evidence),
            escapeCSVField(f.priority),
            escapeCSVField(f.impact),
            escapeCSVField(f.fix),
            escapeCSVField(f.owner),
            escapeCSVField(f.status)
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `accessibility-audit-findings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Global reference for active trigger element
let lastActiveElement = null;

function openDetailsDialog(findingId) {
    const dialog = document.getElementById("details-dialog");
    const dialogTitle = document.getElementById("dialog-title");
    const dialogBody = document.getElementById("dialog-content");

    if (!dialog || !dialogTitle || !dialogBody) return;

    const findings = getStoredFindings();
    const finding = findings.find(function (f) {
        return f.id === findingId;
    });

    if (!finding) return;

    lastActiveElement = document.activeElement;
    dialogTitle.textContent = `${finding.id}: ${finding.title}`;

    const priorityClass = finding.priority.toLowerCase();
    const statusClass = finding.status === "Open" ? "open" : (finding.status === "Needs verification" ? "verify" : "resolved");

    dialogBody.innerHTML = `
        <div class="modal-badges-row">
            <span class="badge ${priorityClass}">Priority: ${escapeHTML(finding.priority)}</span>
            <span class="badge ${statusClass}">Status: ${escapeHTML(finding.status)}</span>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">Affected Component</h3>
            <p class="modal-detail-value">${escapeHTML(finding.component)}</p>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">WCAG 2.1 Reference</h3>
            <p class="modal-detail-value">${escapeHTML(finding.wcag)}</p>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">Audit Evidence</h3>
            <p class="modal-detail-value">${escapeHTML(finding.evidence)}</p>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">Potential User Impact</h3>
            <p class="modal-detail-value">${escapeHTML(finding.impact)}</p>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">Recommended Fix</h3>
            <p class="modal-detail-value">${escapeHTML(finding.fix)}</p>
        </div>

        <div class="modal-detail-row">
            <h3 class="modal-detail-label">Assigned Owner</h3>
            <p class="modal-detail-value">${escapeHTML(finding.owner || "Student")}</p>
        </div>
    `;

    if (typeof dialog.showModal === "function") {
        dialog.showModal();
        const closeBtn = document.getElementById("close-dialog");
        if (closeBtn) closeBtn.focus();
    } else {
        alert(`${finding.id} — ${finding.title}\n\nEvidence: ${finding.evidence}\n\nRecommended Fix: ${finding.fix}`);
    }
}

function closeDetailsDialog() {
    const dialog = document.getElementById("details-dialog");
    if (dialog && dialog.open) {
        dialog.close();
        if (lastActiveElement && typeof lastActiveElement.focus === "function") {
            lastActiveElement.focus();
        }
    }
}

/**
 * Mobile Navigation Drawer
 */
function initNavigation() {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    if (!menuToggle || !sidebar) return;

    function toggleMenu(show) {
        const isExpanded = show !== undefined ? show : menuToggle.getAttribute("aria-expanded") !== "true";
        menuToggle.setAttribute("aria-expanded", String(isExpanded));
        if (isExpanded) {
            sidebar.classList.add("is-open");
            if (backdrop) backdrop.classList.add("is-visible");
        } else {
            sidebar.classList.remove("is-open");
            if (backdrop) backdrop.classList.remove("is-visible");
        }
    }

    menuToggle.addEventListener("click", function () {
        toggleMenu();
    });

    if (backdrop) {
        backdrop.addEventListener("click", function () {
            toggleMenu(false);
        });
    }

    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
            toggleMenu(false);
            menuToggle.focus();
        }
    });

    const findings = getStoredFindings();
    const navBadges = document.querySelectorAll(".nav-findings-count");
    navBadges.forEach(function (badge) {
        badge.textContent = findings.length;
    });
}

function initModalListeners() {
    const dialog = document.getElementById("details-dialog");
    if (!dialog) return;

    const closeBtn = document.getElementById("close-dialog");
    const footerCloseBtn = document.getElementById("close-details-footer");

    if (closeBtn) closeBtn.addEventListener("click", closeDetailsDialog);
    if (footerCloseBtn) footerCloseBtn.addEventListener("click", closeDetailsDialog);

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            closeDetailsDialog();
        }
    });

    dialog.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDetailsDialog();
        }
    });

    dialog.addEventListener("close", function () {
        if (lastActiveElement && typeof lastActiveElement.focus === "function") {
            lastActiveElement.focus();
        }
    });
}

/**
 * Theme Manager (Dark / Light Mode)
 */
function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
        // ignore
    }

    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme ? savedTheme : (prefersDark ? "dark" : "light");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            if (themeToggle) {
                themeToggle.setAttribute("aria-pressed", "true");
                themeToggle.setAttribute("aria-label", "Switch to light theme");
            }
        } else {
            document.documentElement.removeAttribute("data-theme");
            if (themeToggle) {
                themeToggle.setAttribute("aria-pressed", "false");
                themeToggle.setAttribute("aria-label", "Switch to dark theme");
            }
        }
    }

    applyTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            const newTheme = isDark ? "light" : "dark";
            applyTheme(newTheme);
            try {
                localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            } catch (e) {
                console.warn("Unable to save theme preference.", e);
            }
        });
    }

    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
            try {
                if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                    applyTheme(e.matches ? "dark" : "light");
                }
            } catch (err) {
                // ignore
            }
        });
    }
}

/**
 * Findings Table Rendering & Filtering (Task 03 / 04)
 */
function initFindingsTable() {
    const tableBody = document.getElementById("findings-table");
    if (!tableBody) return;

    const searchInput = document.getElementById("search-input");
    const statusFilter = document.getElementById("status-filter");
    const priorityFilter = document.getElementById("priority-filter");
    const resultsCount = document.getElementById("results-count");
    const resetFiltersBtn = document.getElementById("reset-filters");
    const exportCsvBtn = document.getElementById("export-csv-btn");

    function render() {
        const findings = getStoredFindings();
        const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const selectedStatus = statusFilter ? statusFilter.value : "all";
        const selectedPriority = priorityFilter ? priorityFilter.value : "all";

        const filtered = findings.filter(function (item) {
            const searchable = [
                item.id,
                item.component,
                item.title,
                item.wcag,
                item.evidence,
                item.impact,
                item.fix,
                item.owner
            ].join(" ").toLowerCase();

            const matchQuery = query === "" || searchable.includes(query);
            const matchStatus = selectedStatus === "all" || item.status.toLowerCase() === selectedStatus.toLowerCase();
            const matchPriority = selectedPriority === "all" || item.priority.toLowerCase() === selectedPriority.toLowerCase();

            return matchQuery && matchStatus && matchPriority;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state-row">
                        <p>No findings matched your filter criteria.</p>
                        <button type="button" class="button secondary" id="clear-filters-btn">Clear all filters</button>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = filtered.map(function (item) {
                const priorityClass = item.priority.toLowerCase();
                const statusClass = item.status === "Open" ? "open" : (item.status === "Needs verification" ? "verify" : "resolved");

                return `
                    <tr>
                        <td>
                            <span class="issue-id-tag">${escapeHTML(item.id)}</span>
                            <span class="issue-cell-title">${escapeHTML(item.title)}</span>
                        </td>
                        <td>
                            <span class="component-name">${escapeHTML(item.component)}</span>
                            <span class="wcag-ref">${escapeHTML(item.wcag)}</span>
                        </td>
                        <td>
                            <span class="badge ${priorityClass}">${escapeHTML(item.priority)}</span>
                        </td>
                        <td>
                            <span class="badge ${statusClass}">${escapeHTML(item.status)}</span>
                        </td>
                        <td>
                            <button
                                type="button"
                                class="action-btn"
                                data-finding-id="${escapeHTML(item.id)}"
                                aria-label="View details for ${escapeHTML(item.id)}: ${escapeHTML(item.title)}">
                                View Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        if (resultsCount) {
            resultsCount.textContent = `Showing ${filtered.length} of ${findings.length} recorded findings`;
        }
    }

    if (searchInput) searchInput.addEventListener("input", render);
    if (statusFilter) statusFilter.addEventListener("change", render);
    if (priorityFilter) priorityFilter.addEventListener("change", render);

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", function () {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "all";
            if (priorityFilter) priorityFilter.value = "all";
            render();
            if (searchInput) searchInput.focus();
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener("click", function () {
            exportFindingsToCSV(getStoredFindings());
        });
    }

    tableBody.addEventListener("click", function (event) {
        if (event.target.id === "clear-filters-btn" || event.target.closest("#clear-filters-btn")) {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "all";
            if (priorityFilter) priorityFilter.value = "all";
            render();
            if (searchInput) searchInput.focus();
            return;
        }

        const btn = event.target.closest("[data-finding-id]");
        if (btn) {
            openDetailsDialog(btn.dataset.findingId);
        }
    });

    render();
}

/**
 * Add New Finding Form
 */
function initAddFindingForm() {
    const form = document.getElementById("add-finding-form");
    if (!form) return;

    const errorSummary = document.getElementById("error-summary");
    const errorSummaryList = document.getElementById("error-summary-list");
    const successBanner = document.getElementById("success-banner");
    const idInput = document.getElementById("finding-id");

    function suggestNextId() {
        if (!idInput) return;
        const findings = getStoredFindings();
        let maxNum = 0;
        findings.forEach(function (f) {
            const match = String(f.id).match(/^WEB-(\d+)$/i);
            if (match) {
                const n = parseInt(match[1], 10);
                if (n > maxNum) maxNum = n;
            }
        });
        const nextNum = maxNum > 0 ? maxNum + 1 : findings.length + 1;
        const formattedNum = String(nextNum).padStart(3, "0");
        idInput.value = `WEB-${formattedNum}`;
    }

    suggestNextId();

    const requiredFields = [
        { id: "finding-id", name: "Issue ID", message: "Please provide a unique Issue ID (e.g., WEB-006)." },
        { id: "finding-title", name: "Issue Title", message: "Please provide a concise issue title." },
        { id: "component-name", name: "Component Name", message: "Please specify the affected component or page region." },
        { id: "wcag-reference", name: "WCAG Reference", message: "Please provide or select a WCAG Success Criterion reference." },
        { id: "issue-description", name: "Issue Description", message: "Please describe the accessibility barrier in detail." },
        { id: "audit-evidence", name: "Audit Evidence", message: "Please record the audit evidence or Lighthouse report output." },
        { id: "user-impact", name: "Potential User Impact", message: "Please explain the impact on users with disabilities." },
        { id: "recommended-fix", name: "Recommended Fix", message: "Please provide technical remediation instructions." },
        { id: "finding-priority", name: "Priority", message: "Please select an audit priority level." },
        { id: "finding-status", name: "Status", message: "Please select an issue status." },
        { id: "finding-owner", name: "Owner", message: "Please specify the auditor or issue owner." }
    ];

    requiredFields.forEach(function (field) {
        const input = document.getElementById(field.id);
        if (input) {
            const clearField = function () {
                if (input.value.trim()) {
                    input.removeAttribute("aria-invalid");
                    const errEl = document.getElementById(`${field.id}-error`);
                    if (errEl) {
                        errEl.classList.remove("is-visible");
                        errEl.textContent = "";
                    }
                }
            };
            input.addEventListener("input", clearField);
            input.addEventListener("change", clearField);
        }
    });

    function clearErrors() {
        if (errorSummary) errorSummary.classList.remove("is-visible");
        if (errorSummaryList) errorSummaryList.innerHTML = "";
        requiredFields.forEach(function (field) {
            const el = document.getElementById(field.id);
            const errEl = document.getElementById(`${field.id}-error`);
            if (el) el.removeAttribute("aria-invalid");
            if (errEl) {
                errEl.classList.remove("is-visible");
                errEl.textContent = "";
            }
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        clearErrors();
        if (successBanner) successBanner.classList.remove("is-visible");

        const errors = [];

        requiredFields.forEach(function (field) {
            const input = document.getElementById(field.id);
            if (!input) return;

            const val = input.value.trim();
            if (!val) {
                errors.push({
                    id: field.id,
                    name: field.name,
                    message: field.message
                });
                input.setAttribute("aria-invalid", "true");
                const errEl = document.getElementById(`${field.id}-error`);
                if (errEl) {
                    errEl.classList.add("is-visible");
                    errEl.textContent = field.message;
                }
            }
        });

        const currentId = idInput ? idInput.value.trim().toUpperCase() : "";
        const findings = getStoredFindings();
        const idExists = findings.some(function (f) {
            return f.id.toUpperCase() === currentId;
        });

        if (idExists) {
            errors.push({
                id: "finding-id",
                name: "Issue ID",
                message: `Issue ID "${currentId}" is already used. Please provide a unique ID.`
            });
            idInput.setAttribute("aria-invalid", "true");
            const errEl = document.getElementById("finding-id-error");
            if (errEl) {
                errEl.classList.add("is-visible");
                errEl.textContent = `Issue ID "${currentId}" is already used. Please choose a unique ID.`;
            }
        }

        if (errors.length > 0) {
            if (errorSummary && errorSummaryList) {
                errorSummaryList.innerHTML = errors.map(function (err) {
                    return `<li><a href="#${err.id}">${escapeHTML(err.name)}: ${escapeHTML(err.message)}</a></li>`;
                }).join("");
                errorSummary.classList.add("is-visible");
                errorSummary.focus();
            }
            return;
        }

        const newFinding = {
            id: currentId,
            title: document.getElementById("finding-title").value.trim(),
            component: document.getElementById("component-name").value.trim(),
            wcag: document.getElementById("wcag-reference").value.trim(),
            evidence: document.getElementById("audit-evidence").value.trim(),
            impact: document.getElementById("user-impact").value.trim(),
            fix: document.getElementById("recommended-fix").value.trim(),
            priority: document.getElementById("finding-priority").value,
            status: document.getElementById("finding-status").value,
            owner: document.getElementById("finding-owner").value.trim()
        };

        findings.push(newFinding);
        saveFindingsToStorage(findings);

        form.reset();
        suggestNextId();

        if (successBanner) {
            successBanner.classList.add("is-visible");
            successBanner.focus();
            successBanner.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        const navBadges = document.querySelectorAll(".nav-findings-count");
        navBadges.forEach(function (badge) {
            badge.textContent = findings.length;
        });
    });

    form.addEventListener("reset", function () {
        clearErrors();
        if (successBanner) successBanner.classList.remove("is-visible");
        setTimeout(suggestNextId, 10);
    });
}

function updateDashboardStats() {
    const findings = getStoredFindings();

    const totalEl = document.getElementById("total-findings");
    const verifyEl = document.getElementById("verification-count");
    const openEl = document.getElementById("open-count");
    const resolvedEl = document.getElementById("resolved-count");

    if (totalEl) totalEl.textContent = findings.length;

    if (verifyEl) {
        verifyEl.textContent = findings.filter(function (f) {
            return f.status.toLowerCase() === "needs verification";
        }).length;
    }

    if (openEl) {
        openEl.textContent = findings.filter(function (f) {
            return f.status.toLowerCase() === "open";
        }).length;
    }

    if (resolvedEl) {
        resolvedEl.textContent = findings.filter(function (f) {
            return f.status.toLowerCase() === "resolved";
        }).length;
    }
}

// Reset helper for testing
if (typeof window !== "undefined") {
    window.resetFindingsToBaseline = function () {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // ignore
        }
        location.reload();
    };
}

/* ==========================================================================
   TASK 05: LIVE REPOSITORY ACTIVITY & GITHUB API CLIENT CONTROLLER
   ========================================================================== */

/**
 * Activity State Management
 */
const ActivityController = (function () {
    let commitsData = [];
    let repoData = null;
    let activeCategory = "All";
    let searchQuery = "";
    let sortOrder = "newest";
    let isLoading = false;

    // DOM Elements Cache
    let containerEl = null;
    let statusEl = null;
    let countEl = null;
    let searchInputEl = null;
    let sortSelectEl = null;
    let refreshBtnEl = null;
    let tabButtons = [];
    let repoStatsEl = null;

    function renderLoadingSkeleton() {
        if (!containerEl) return;
        containerEl.innerHTML = `
            <div class="activity-loading-skeleton" aria-busy="true" aria-label="Loading repository activity...">
                <div class="skeleton-card">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-text"></div>
                    <div class="skeleton-line skeleton-meta"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-text"></div>
                    <div class="skeleton-line skeleton-meta"></div>
                </div>
                <div class="skeleton-card">
                    <div class="skeleton-line skeleton-title"></div>
                    <div class="skeleton-line skeleton-text"></div>
                    <div class="skeleton-line skeleton-meta"></div>
                </div>
            </div>
        `;
        if (statusEl) {
            statusEl.textContent = "Connecting to GitHub REST API and loading live commits...";
        }
    }

    function renderError(message, isRateLimit = false, resetDate = null) {
        if (!containerEl) return;
        const resetNote = resetDate ? `<p class="activity-error-sub">Rate limit resets at ${resetDate.toLocaleTimeString()}.</p>` : "";
        containerEl.innerHTML = `
            <div class="activity-error-card" role="alert">
                <div class="activity-error-icon" aria-hidden="true">⚠️</div>
                <div class="activity-error-content">
                    <h3 class="activity-error-title">${isRateLimit ? "GitHub API Rate Limit Reached" : "Unable to Load Repository Activity"}</h3>
                    <p class="activity-error-message">${escapeHTML(message)}</p>
                    ${resetNote}
                    <div class="activity-error-actions">
                        <button type="button" id="activity-retry-btn" class="button primary">
                            Try Again 🔄
                        </button>
                    </div>
                </div>
            </div>
        `;

        const retryBtn = document.getElementById("activity-retry-btn");
        if (retryBtn) {
            retryBtn.addEventListener("click", function () {
                loadData(true);
            });
        }

        if (statusEl) {
            statusEl.textContent = `Error loading activity: ${message}`;
        }
    }

    function renderRepoStats(repo, fromCache, isStale) {
        if (!repoStatsEl || !repo) return;

        const cachePill = fromCache
            ? `<span class="badge ${isStale ? "verify" : "in-progress"}" title="Served from local browser cache">${isStale ? "Cached (Stale)" : "Cached"}</span>`
            : `<span class="badge resolved" title="Live GitHub REST API Response">Live API</span>`;

        repoStatsEl.innerHTML = `
            <div class="repo-stats-grid">
                <div class="repo-stat-item">
                    <span class="repo-stat-label">Repository</span>
                    <a href="${escapeHTML(repo.htmlUrl)}" target="_blank" rel="noopener noreferrer" class="repo-stat-link">
                        ${escapeHTML(repo.fullName)} ↗
                    </a>
                </div>
                <div class="repo-stat-item">
                    <span class="repo-stat-label">Default Branch</span>
                    <span class="repo-stat-val"><code>${escapeHTML(repo.defaultBranch)}</code></span>
                </div>
                <div class="repo-stat-item">
                    <span class="repo-stat-label">Stars / Forks</span>
                    <span class="repo-stat-val">★ ${escapeHTML(repo.stars)} · ⑂ ${escapeHTML(repo.forks)}</span>
                </div>
                <div class="repo-stat-item">
                    <span class="repo-stat-label">Open Issues</span>
                    <span class="repo-stat-val">${escapeHTML(repo.openIssues)}</span>
                </div>
                <div class="repo-stat-item repo-stat-status">
                    <span class="repo-stat-label">Data Source</span>
                    ${cachePill}
                </div>
            </div>
        `;
    }

    function getFilteredAndSortedCommits() {
        const query = searchQuery.trim().toLowerCase();

        const filtered = commitsData.filter(function (commit) {
            // Category check
            const matchesCategory =
                activeCategory === "All" ||
                commit.category.toLowerCase() === activeCategory.toLowerCase();

            // Search query check (title, body, author, SHA)
            const searchable = [
                commit.title,
                commit.body,
                commit.authorName,
                commit.authorLogin,
                commit.shaShort
            ].join(" ").toLowerCase();

            const matchesQuery = query === "" || searchable.includes(query);

            return matchesCategory && matchesQuery;
        });

        // Sorting
        filtered.sort(function (a, b) {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }

    function renderCommits() {
        if (!containerEl) return;

        const commits = getFilteredAndSortedCommits();

        // Update counts
        if (countEl) {
            countEl.textContent = `Showing ${commits.length} of ${commitsData.length} commits`;
        }

        if (statusEl) {
            statusEl.textContent = `Displaying ${commits.length} commits for category "${activeCategory}".`;
        }

        // Empty state
        if (commits.length === 0) {
            containerEl.innerHTML = `
                <div class="activity-empty-state">
                    <p class="empty-title">No commits found matching your criteria.</p>
                    <p class="empty-subtitle">Try refining your search terms or selecting another category tab.</p>
                    <button type="button" id="activity-reset-filters-btn" class="button secondary">
                        Reset Activity Filters
                    </button>
                </div>
            `;
            const resetBtn = document.getElementById("activity-reset-filters-btn");
            if (resetBtn) {
                resetBtn.addEventListener("click", function () {
                    searchQuery = "";
                    activeCategory = "All";
                    sortOrder = "newest";
                    if (searchInputEl) searchInputEl.value = "";
                    if (sortSelectEl) sortSelectEl.value = "newest";
                    updateActiveTab();
                    persistPrefs();
                    renderCommits();
                    if (searchInputEl) searchInputEl.focus();
                });
            }
            return;
        }

        // Render commit card list
        containerEl.innerHTML = `
            <div class="commits-timeline">
                ${commits.map(function (c) {
                    const catLower = c.category.toLowerCase();
                    const categoryPillClass =
                        catLower === "features" ? "features-pill" :
                        (catLower === "fixes" ? "fixes-pill" :
                        (catLower === "documentation" ? "docs-pill" : "other-pill"));

                    return `
                        <article class="commit-card" aria-labelledby="commit-${escapeHTML(c.shaShort)}">
                            <div class="commit-card-header">
                                <div class="commit-author-group">
                                    <img src="${escapeHTML(c.authorAvatar)}"
                                         alt="Avatar of ${escapeHTML(c.authorName)}"
                                         class="commit-author-avatar"
                                         loading="lazy">
                                    <div class="commit-author-meta">
                                        <span class="commit-author-name">${escapeHTML(c.authorName)}</span>
                                        <time datetime="${escapeHTML(c.date)}" class="commit-date">
                                            ${formatDate(c.date)}
                                        </time>
                                    </div>
                                </div>

                                <div class="commit-badges-group">
                                    <span class="commit-category-tag ${categoryPillClass}" title="Inferred category from commit message">
                                        ${escapeHTML(c.category)}
                                    </span>
                                    <a href="${escapeHTML(c.htmlUrl)}"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       class="commit-sha-badge"
                                       aria-label="View commit ${escapeHTML(c.shaShort)} on GitHub (opens in new tab)">
                                        <code>${escapeHTML(c.shaShort)}</code> ↗
                                    </a>
                                </div>
                            </div>

                            <h4 id="commit-${escapeHTML(c.shaShort)}" class="commit-title">
                                ${escapeHTML(c.title)}
                            </h4>

                            ${c.body ? `<p class="commit-body-text">${escapeHTML(c.body)}</p>` : ""}
                        </article>
                    `;
                }).join("")}
            </div>
        `;
    }

    function updateActiveTab() {
        tabButtons.forEach(function (btn) {
            const cat = btn.getAttribute("data-category");
            const isSelected = cat.toLowerCase() === activeCategory.toLowerCase();
            btn.setAttribute("aria-selected", String(isSelected));
            if (isSelected) {
                btn.classList.add("is-active");
                if (containerEl && btn.id) {
                    containerEl.setAttribute("aria-labelledby", btn.id);
                }
            } else {
                btn.classList.remove("is-active");
            }
        });
    }

    function persistPrefs() {
        if (typeof ApiClient !== "undefined" && typeof ApiClient.savePreferences === "function") {
            ApiClient.savePreferences({
                search: searchQuery,
                category: activeCategory,
                sort: sortOrder
            });
        }
    }

    function restorePrefs() {
        if (typeof ApiClient !== "undefined" && typeof ApiClient.getStoredPreferences === "function") {
            const prefs = ApiClient.getStoredPreferences();
            searchQuery = prefs.search || "";
            activeCategory = prefs.category || "All";
            sortOrder = prefs.sort || "newest";

            if (searchInputEl) searchInputEl.value = searchQuery;
            if (sortSelectEl) sortSelectEl.value = sortOrder;
            updateActiveTab();
        }
    }

    async function loadData(forceRefresh = false) {
        if (isLoading) return;
        isLoading = true;

        renderLoadingSkeleton();

        try {
            if (typeof ApiClient === "undefined") {
                throw new Error("ApiClient module not loaded.");
            }

            // Fetch repo details and commits concurrently
            const [repoRes, commitsRes] = await Promise.all([
                ApiClient.fetchRepoDetails({ forceRefresh: forceRefresh }),
                ApiClient.fetchRecentCommits({ forceRefresh: forceRefresh, perPage: 30 })
            ]);

            repoData = repoRes.data;
            commitsData = commitsRes.data;

            renderRepoStats(repoData, repoRes.fromCache, repoRes.isStale);
            renderCommits();
        } catch (err) {
            console.error("[ActivityController] Failed to load activity:", err);
            renderError(err.message, err.isRateLimit, err.resetDate);
        } finally {
            isLoading = false;
        }
    }

    function init() {
        containerEl = document.getElementById("commits-list-container");
        if (!containerEl) return; // Not on page with activity feed

        statusEl = document.getElementById("activity-live-status");
        countEl = document.getElementById("activity-results-count");
        searchInputEl = document.getElementById("activity-search-input");
        sortSelectEl = document.getElementById("activity-sort-select");
        refreshBtnEl = document.getElementById("activity-refresh-btn");
        repoStatsEl = document.getElementById("repo-live-stats");
        tabButtons = Array.from(document.querySelectorAll("[data-category]"));

        restorePrefs();

        // Search input with live filter
        if (searchInputEl) {
            searchInputEl.addEventListener("input", function () {
                searchQuery = searchInputEl.value;
                persistPrefs();
                renderCommits();
            });
        }

        // Sort selector
        if (sortSelectEl) {
            sortSelectEl.addEventListener("change", function () {
                sortOrder = sortSelectEl.value;
                persistPrefs();
                renderCommits();
            });
        }

        // Category Tab buttons (Click & Keyboard Arrow navigation)
        tabButtons.forEach(function (btn, idx) {
            btn.addEventListener("click", function () {
                activeCategory = btn.getAttribute("data-category") || "All";
                updateActiveTab();
                persistPrefs();
                renderCommits();
            });

            btn.addEventListener("keydown", function (e) {
                let targetIdx = null;
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    targetIdx = (idx + 1) % tabButtons.length;
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    targetIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
                } else if (e.key === "Home") {
                    e.preventDefault();
                    targetIdx = 0;
                } else if (e.key === "End") {
                    e.preventDefault();
                    targetIdx = tabButtons.length - 1;
                }

                if (targetIdx !== null) {
                    const targetBtn = tabButtons[targetIdx];
                    targetBtn.focus();
                    targetBtn.click();
                }
            });
        });

        // Manual Refresh Button
        if (refreshBtnEl) {
            refreshBtnEl.addEventListener("click", function () {
                loadData(true);
            });
        }

        // Initial Data Fetch
        loadData(false);
    }

    return {
        init: init,
        loadData: loadData
    };
})();

// Global initialization on DOM ready
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initNavigation();
        initModalListeners();
        initFindingsTable();
        initAddFindingForm();
        updateDashboardStats();
        ActivityController.init();
    });
}

// Universal export
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        INITIAL_FINDINGS: INITIAL_FINDINGS,
        getStoredFindings: getStoredFindings,
        saveFindingsToStorage: saveFindingsToStorage,
        exportFindingsToCSV: exportFindingsToCSV,
        ActivityController: ActivityController
    };
}
