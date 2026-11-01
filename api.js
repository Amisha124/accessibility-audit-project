/**
 * RESTful API Client for GitHub Repository Integration
 * Task: RabTech Academy Internship – Task 05
 * Topic: Dynamic JavaScript DOM Logic & RESTful API Client
 *
 * Repository Target: https://github.com/Amisha124/accessibility-audit-project
 * Uses public endpoints that require no authentication or secrets.
 */

"use strict";

const ApiClient = (function () {
    const REPO_OWNER = "Amisha124";
    const REPO_NAME = "accessibility-audit-project";
    const BASE_URL = "https://api.github.com";

    // Cache Configuration
    const CACHE_KEYS = {
        REPO: "accessibility_audit_repo_cache",
        COMMITS: "accessibility_audit_commits_cache",
        PREFS: "accessibility_audit_activity_prefs"
    };

    // Cache Time-To-Live: 10 minutes (in milliseconds)
    const CACHE_TTL_MS = 10 * 60 * 1000;

    /**
     * Retrieve data from localStorage cache if still valid.
     */
    function getFromCache(key) {
        if (typeof localStorage === "undefined") return null;
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;

            const item = JSON.parse(raw);
            if (!item || !item.timestamp || !item.data) return null;

            const age = Date.now() - item.timestamp;
            const isStale = age > CACHE_TTL_MS;

            return {
                data: item.data,
                timestamp: item.timestamp,
                isStale: isStale,
                ageSeconds: Math.floor(age / 1000)
            };
        } catch (e) {
            console.warn(`[ApiClient] Cache read error for ${key}:`, e);
            return null;
        }
    }

    /**
     * Save data to localStorage cache with timestamp.
     */
    function saveToCache(key, data) {
        if (typeof localStorage === "undefined") return;
        try {
            const item = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e) {
            console.warn(`[ApiClient] Cache write error for ${key}:`, e);
        }
    }

    /**
     * Infer commit category from commit message keywords.
     * Categorization is heuristic and inferred directly from text.
     */
    function inferCommitCategory(message) {
        if (!message) return "Other";

        const text = message.toLowerCase();

        // 1. Documentation
        if (
            text.includes("doc") ||
            text.includes("readme") ||
            text.includes("guide") ||
            text.includes("license") ||
            text.includes("screenshot")
        ) {
            return "Documentation";
        }

        // 2. Fixes & Remediations
        if (
            text.includes("fix") ||
            text.includes("bug") ||
            text.includes("patch") ||
            text.includes("correct") ||
            text.includes("resolve") ||
            text.includes("issue") ||
            text.includes("error") ||
            text.includes("repair")
        ) {
            return "Fixes";
        }

        // 3. Features & Implementations
        if (
            text.includes("feat") ||
            text.includes("add") ||
            text.includes("implement") ||
            text.includes("complete") ||
            text.includes("create") ||
            text.includes("tokens") ||
            text.includes("architecture") ||
            text.includes("support") ||
            text.includes("upgrade")
        ) {
            return "Features";
        }

        return "Other";
    }

    /**
     * Format a raw commit object from GitHub API into clean client structure.
     */
    function formatCommit(raw) {
        const message = raw.commit && raw.commit.message ? raw.commit.message : "No message provided";
        const messageParts = message.split("\n");
        const title = messageParts[0].trim();
        const body = messageParts.slice(1).join("\n").trim();

        const authorName =
            (raw.commit && raw.commit.author && raw.commit.author.name) ||
            (raw.author && raw.author.login) ||
            "Anonymous";

        const authorLogin = raw.author ? raw.author.login : authorName;
        const authorAvatar =
            raw.author && raw.author.avatar_url
                ? raw.author.avatar_url
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=075c58&color=fff&size=80`;

        const dateStr =
            (raw.commit && raw.commit.author && raw.commit.author.date) ||
            new Date().toISOString();

        const shaShort = raw.sha ? raw.sha.slice(0, 7) : "0000000";
        const category = inferCommitCategory(message);

        return {
            sha: raw.sha || "",
            shaShort: shaShort,
            title: title,
            body: body,
            category: category,
            authorName: authorName,
            authorLogin: authorLogin,
            authorAvatar: authorAvatar,
            date: dateStr,
            htmlUrl: raw.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/commit/${raw.sha}`
        };
    }

    /**
     * Perform HTTP GET request with error, rate-limit, and network handling.
     */
    async function request(url) {
        const headers = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "AccessibilityAuditApp-Task05"
        };

        const response = await fetch(url, { headers });

        // Check Rate Limiting
        const remaining = response.headers.get("x-ratelimit-remaining");
        const resetTime = response.headers.get("x-ratelimit-reset");

        if (response.status === 403 && remaining === "0") {
            const resetDate = resetTime ? new Date(parseInt(resetTime, 10) * 1000) : null;
            const resetMsg = resetDate ? ` Resets at ${resetDate.toLocaleTimeString()}.` : "";
            const err = new Error(`GitHub API rate limit reached (60 requests/hr for unauthenticated users).${resetMsg}`);
            err.status = 403;
            err.isRateLimit = true;
            err.resetDate = resetDate;
            throw err;
        }

        if (!response.ok) {
            const err = new Error(`GitHub API request failed with status ${response.status}: ${response.statusText}`);
            err.status = response.status;
            throw err;
        }

        return await response.json();
    }

    /**
     * Fetch Live Repository Details (Stars, Forks, Issues, Default Branch, URL).
     */
    async function fetchRepoDetails(options = {}) {
        const forceRefresh = options.forceRefresh === true;

        if (!forceRefresh) {
            const cached = getFromCache(CACHE_KEYS.REPO);
            if (cached && !cached.isStale) {
                return {
                    data: cached.data,
                    fromCache: true,
                    isStale: false,
                    cachedAt: cached.timestamp
                };
            }
        }

        try {
            const url = `${BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}`;
            const raw = await request(url);

            const data = {
                fullName: raw.full_name || `${REPO_OWNER}/${REPO_NAME}`,
                description: raw.description || "Accessibility Audit Dashboard for National Portal of India.",
                stars: raw.stargazers_count || 0,
                forks: raw.forks_count || 0,
                openIssues: raw.open_issues_count || 0,
                watchers: raw.watchers_count || 0,
                defaultBranch: raw.default_branch || "main",
                htmlUrl: raw.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
                updatedAt: raw.updated_at || new Date().toISOString()
            };

            saveToCache(CACHE_KEYS.REPO, data);

            return {
                data: data,
                fromCache: false,
                isStale: false,
                cachedAt: Date.now()
            };
        } catch (error) {
            // Graceful Fallback: Return cached data if available even if stale
            const cached = getFromCache(CACHE_KEYS.REPO);
            if (cached) {
                console.warn("[ApiClient] Network failed, falling back to cached repo details.", error);
                return {
                    data: cached.data,
                    fromCache: true,
                    isStale: true,
                    cachedAt: cached.timestamp,
                    warning: error.message
                };
            }
            throw error;
        }
    }

    /**
     * Fetch Recent Commits with category classification.
     */
    async function fetchRecentCommits(options = {}) {
        const forceRefresh = options.forceRefresh === true;
        const perPage = options.perPage || 30;

        if (!forceRefresh) {
            const cached = getFromCache(CACHE_KEYS.COMMITS);
            if (cached && !cached.isStale) {
                return {
                    data: cached.data,
                    fromCache: true,
                    isStale: false,
                    cachedAt: cached.timestamp
                };
            }
        }

        try {
            const url = `${BASE_URL}/repos/${REPO_OWNER}/${REPO_NAME}/commits?per_page=${perPage}`;
            const rawList = await request(url);

            if (!Array.isArray(rawList)) {
                throw new Error("Invalid commits payload received from GitHub API.");
            }

            const formatted = rawList.map(formatCommit);
            saveToCache(CACHE_KEYS.COMMITS, formatted);

            return {
                data: formatted,
                fromCache: false,
                isStale: false,
                cachedAt: Date.now()
            };
        } catch (error) {
            // Graceful Fallback: Return cached commits if available
            const cached = getFromCache(CACHE_KEYS.COMMITS);
            if (cached) {
                console.warn("[ApiClient] Network failed, falling back to cached commits.", error);
                return {
                    data: cached.data,
                    fromCache: true,
                    isStale: true,
                    cachedAt: cached.timestamp,
                    warning: error.message
                };
            }
            throw error;
        }
    }

    /**
     * Save and load user search & filter preferences.
     */
    function getStoredPreferences() {
        if (typeof localStorage === "undefined") return { search: "", category: "All", sort: "newest" };
        try {
            const raw = localStorage.getItem(CACHE_KEYS.PREFS);
            if (!raw) return { search: "", category: "All", sort: "newest" };
            return JSON.parse(raw);
        } catch (e) {
            return { search: "", category: "All", sort: "newest" };
        }
    }

    function savePreferences(prefs) {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(CACHE_KEYS.PREFS, JSON.stringify(prefs));
        } catch (e) {
            console.warn("[ApiClient] Could not save preferences to localStorage:", e);
        }
    }

    /**
     * Clear all cached API responses.
     */
    function clearCache() {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.removeItem(CACHE_KEYS.REPO);
            localStorage.removeItem(CACHE_KEYS.COMMITS);
        } catch (e) {
            // ignore
        }
    }

    return {
        REPO_OWNER: REPO_OWNER,
        REPO_NAME: REPO_NAME,
        BASE_URL: BASE_URL,
        fetchRepoDetails: fetchRepoDetails,
        fetchRecentCommits: fetchRecentCommits,
        inferCommitCategory: inferCommitCategory,
        getStoredPreferences: getStoredPreferences,
        savePreferences: savePreferences,
        clearCache: clearCache
    };
})();

// Attach to window for universal browser script support
if (typeof window !== "undefined") {
    window.ApiClient = ApiClient;
}

// Support Node.js testing environment
if (typeof module !== "undefined" && module.exports) {
    module.exports = ApiClient;
}
