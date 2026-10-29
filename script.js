
"use strict";

// Accessibility Audit Dashboard
// Findings are based on the Lighthouse report for India.gov.in.

const findings = [
    {
        id: "WEB-001",
        component: "Top Bar Service List",
        title: "ARIA Role Parent Relationship",
        wcag: "WCAG 2.1 - 1.3.1",
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
        wcag: "WCAG 2.1 - 1.4.3",
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
        wcag: "WCAG 2.1 - 1.3.1",
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
        wcag: "Needs verification",
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
        wcag: "Needs verification",
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

// Get dashboard elements
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const tableBody = document.getElementById("findings-table");
const resultsCount = document.getElementById("results-count");

const dialog = document.getElementById("details-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogContent = document.getElementById("dialog-content");

// Escape text before inserting it into HTML
function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, function (character) {
        return entities[character];
    });
}

// Display filtered accessibility findings
function renderFindings() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredFindings = findings.filter(function (finding) {
        const searchableText = [
            finding.id,
            finding.component,
            finding.title,
            finding.wcag,
            finding.evidence,
            finding.impact,
            finding.fix
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesStatus =
            selectedStatus === "all" ||
            finding.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "all" ||
            finding.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (filteredFindings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No findings found. Try changing your search or filters.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = filteredFindings.map(function (finding) {
            const priorityClass = finding.priority.toLowerCase();
            const statusClass =
                finding.status === "Open" ? "open" : "verify";

            return `
                <tr>
                    <td>
                        <span class="issue-id">
                            ${escapeHTML(finding.id)}
                        </span>
                        <span class="issue-title">
                            ${escapeHTML(finding.title)}
                        </span>
                    </td>

                    <td>
                        <span class="component">
                            ${escapeHTML(finding.component)}
                        </span>
                        <span class="wcag">
                            ${escapeHTML(finding.wcag)}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${priorityClass}">
                            ${escapeHTML(finding.priority)}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${statusClass}">
                            ${escapeHTML(finding.status)}
                        </span>
                    </td>

                    <td>
                        <button
                            type="button"
                            class="details-button"
                            data-finding-id="${escapeHTML(finding.id)}">
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    resultsCount.textContent =
        `Showing ${filteredFindings.length} of ${findings.length} findings`;
}

// Open the details dialog for a selected finding
function showFindingDetails(id) {
    const finding = findings.find(function (item) {
        return item.id === id;
    });

    if (!finding) {
        return;
    }

    dialogTitle.textContent = `${finding.id} — ${finding.title}`;

    const details = [
        ["Component", finding.component],
        ["WCAG Reference", finding.wcag],
        ["Evidence", finding.evidence],
        ["Potential User Impact", finding.impact],
        ["Recommended Fix", finding.fix],
        ["Priority", finding.priority],
        ["Status", finding.status],
        ["Owner", finding.owner]
    ];

    dialogContent.innerHTML = details.map(function (item) {
        return `
            <section class="detail-item">
                <h3>${escapeHTML(item[0])}</h3>
                <p>${escapeHTML(item[1])}</p>
            </section>
        `;
    }).join("");

    if (typeof dialog.showModal === "function") {
        dialog.showModal();
    } else {
        alert(
            finding.title +
            "\n\nEvidence: " + finding.evidence +
            "\n\nRecommended fix: " + finding.fix
        );
    }
}

// Search and filter functionality
searchInput.addEventListener("input", renderFindings);
statusFilter.addEventListener("change", renderFindings);
priorityFilter.addEventListener("change", renderFindings);

// Handle View Details buttons
tableBody.addEventListener("click", function (event) {
    const button = event.target.closest("[data-finding-id]");

    if (button) {
        showFindingDetails(button.dataset.findingId);
    }
});

// Close the details dialog
document.getElementById("close-dialog").addEventListener("click", function () {
    dialog.close();
});

document.getElementById("close-details").addEventListener("click", function () {
    dialog.close();
});

// Close dialog when clicking outside its content
dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
        dialog.close();
    }
});

// Update dashboard summary counts
document.getElementById("total-findings").textContent = findings.length;

document.getElementById("verification-count").textContent =
    findings.filter(function (finding) {
        return finding.status === "Needs verification";
    }).length;

// Render the dashboard when the script loads
renderFindings();