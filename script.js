/**
 * Accessibility Audit Dashboard — Application Script
 * Task: RabTech Academy Internship – Task 03
 * Topic: Semantic HTML5 & Accessible Component Architecture
 */

"use strict";

// Canonical baseline findings from the Lighthouse audit of India.gov.in
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

/**
 * Retrieve findings from LocalStorage, initializing with default data if empty.
 */
function getStoredFindings() {
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

/**
 * Persist findings to LocalStorage.
 */
function saveFindingsToStorage(findingsArray) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(findingsArray));
    } catch (e) {
        console.warn("Unable to save findings to localStorage.", e);
    }
}

/**
 * Escape HTML to prevent injection when rendering dynamic content.
 */
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

/**
 * Convert findings array to a properly formatted, compliant CSV string.
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

// Global reference for active trigger element (for returning focus when dialog closes)
let lastActiveElement = null;

/**
 * Open finding details modal with accessible focus trapping and keyboard support.
 */
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

/**
 * Close modal and restore focus to trigger element.
 */
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
 * Initialize responsive mobile sidebar navigation.
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

    // Close mobile menu on Escape key
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
            toggleMenu(false);
            menuToggle.focus();
        }
    });

    // Update nav counter badges on sidebar
    const findings = getStoredFindings();
    const navBadges = document.querySelectorAll(".nav-findings-count");
    navBadges.forEach(function (badge) {
        badge.textContent = findings.length;
    });
}

/**
 * Initialize details dialog listeners.
 */
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

    // Native dialog close event ensures focus restoration regardless of how dialog was closed
    dialog.addEventListener("close", function () {
        if (lastActiveElement && typeof lastActiveElement.focus === "function") {
            lastActiveElement.focus();
        }
    });
}

/**
 * Render findings table rows (used on both findings.html and index.html preview).
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
            const clearBtn = document.getElementById("clear-filters-btn");
            if (clearBtn) {
                clearBtn.addEventListener("click", function () {
                    if (searchInput) searchInput.value = "";
                    if (statusFilter) statusFilter.value = "all";
                    if (priorityFilter) priorityFilter.value = "all";
                    render();
                });
            }
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

    // Event delegation for View Details buttons and Clear Filters button
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
 * Initialize Add New Finding Form (Requirement 3: Accessible Forms)
 */
function initAddFindingForm() {
    const form = document.getElementById("add-finding-form");
    if (!form) return;

    const errorSummary = document.getElementById("error-summary");
    const errorSummaryList = document.getElementById("error-summary-list");
    const successBanner = document.getElementById("success-banner");
    const idInput = document.getElementById("finding-id");

    // Suggest next ID based on existing findings
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

    // Required fields to validate
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

    // Live error clearing when user interacts with field
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
        if (errorSummary) {
            errorSummary.classList.remove("is-visible");
        }
        if (errorSummaryList) {
            errorSummaryList.innerHTML = "";
        }
        requiredFields.forEach(function (field) {
            const el = document.getElementById(field.id);
            const errEl = document.getElementById(`${field.id}-error`);
            if (el) {
                el.removeAttribute("aria-invalid");
            }
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

        // Check if ID is unique
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

        // Create new finding object
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

        // Success state
        form.reset();
        suggestNextId();

        if (successBanner) {
            successBanner.classList.add("is-visible");
            successBanner.focus();
            successBanner.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Update sidebar counter
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

/**
 * Update Dashboard statistics and summary cards (on index.html).
 */
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

// Helper to reset stored findings back to initial 5 baseline records (useful for testing)
window.resetFindingsToBaseline = function () {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // ignore
    }
    location.reload();
};

// Global initialization on DOM ready
document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initModalListeners();
    initFindingsTable();
    initAddFindingForm();
    updateDashboardStats();
});
