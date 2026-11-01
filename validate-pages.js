// validate-pages.js
// Node.js script to validate HTML files against the official W3C Nu HTML Checker API.

const fs = require('fs');
const path = require('path');

const filesToValidate = [
    'index.html',
    'findings.html',
    'add-finding.html',
    'documentation.html'
];

async function validateFile(fileName) {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] ${fileName} does not exist yet.`);
        return { file: fileName, exists: false };
    }

    const html = fs.readFileSync(filePath, 'utf8');
    try {
        const response = await fetch('https://validator.w3.org/nu/?out=json', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'User-Agent': 'AccessibilityAuditValidator/1.0'
            },
            body: html
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const errors = data.messages.filter(m => m.type === 'error');
        const warnings = data.messages.filter(m => m.type === 'info' && m.subType === 'warning');

        return {
            file: fileName,
            exists: true,
            totalMessages: data.messages.length,
            errors,
            warnings,
            messages: data.messages
        };
    } catch (err) {
        console.error(`Error validating ${fileName}:`, err.message);
        return { file: fileName, exists: true, error: err.message };
    }
}

async function run() {
    console.log('--- W3C Nu HTML Checker Validation ---');
    let allPassed = true;

    for (const file of filesToValidate) {
        const result = await validateFile(file);
        if (!result.exists) continue;

        if (result.error) {
            console.log(`[FAIL] ${file}: Could not validate - ${result.error}`);
            allPassed = false;
            continue;
        }

        if (result.errors && result.errors.length > 0) {
            console.log(`[FAIL] ${file} has ${result.errors.length} error(s) and ${result.warnings.length} warning(s):`);
            result.errors.forEach(e => {
                console.log(`  - Line ${e.lastLine}: ${e.message}`);
                if (e.extract) console.log(`    Extract: ${e.extract.trim()}`);
            });
            allPassed = false;
        } else if (result.warnings && result.warnings.length > 0) {
            console.log(`[WARN] ${file} passed with ${result.warnings.length} warning(s):`);
            result.warnings.forEach(w => {
                console.log(`  - Line ${w.lastLine}: ${w.message}`);
            });
        } else {
            console.log(`[PASS] ${file}: 0 errors, 0 warnings (100% valid HTML5)`);
        }
    }

    console.log('--------------------------------------');
    process.exit(allPassed ? 0 : 1);
}

run();

