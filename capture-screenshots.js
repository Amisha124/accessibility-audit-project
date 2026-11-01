const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const indexPath = path.join(__dirname, 'index.html');
const fileUrl = 'file:///' + indexPath.replace(/\\/g, '/');

// Create temporary dark mode html to capture dark theme perfectly
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const darkHtmlPath = path.join(__dirname, 'temp-dark.html');
const darkHtml = indexHtml.replace('<html lang="en">', '<html lang="en" data-theme="dark">');
fs.writeFileSync(darkHtmlPath, darkHtml, 'utf8');
const darkFileUrl = 'file:///' + darkHtmlPath.replace(/\\/g, '/');

const themeScreenshots = [
    {
        name: 'screenshots/theme-light-mode-dashboard.png',
        url: fileUrl,
        width: 1280,
        height: 800,
        desc: 'Light Theme Dashboard'
    },
    {
        name: 'screenshots/theme-dark-mode-dashboard.png',
        url: darkFileUrl,
        width: 1280,
        height: 800,
        desc: 'Dark Theme Dashboard'
    }
];

themeScreenshots.forEach(sc => {
    const outPath = path.join(__dirname, sc.name);
    console.log(`Capturing ${sc.desc} (${sc.width}x${sc.height})...`);
    const cmd = `"${chromePath}" --headless --disable-gpu --hide-scrollbars --window-size=${sc.width},${sc.height} --screenshot="${outPath}" "${sc.url}"`;
    try {
        execSync(cmd, { stdio: 'inherit' });
        const stat = fs.statSync(outPath);
        console.log(`Saved ${sc.name} (${stat.size} bytes).`);
    } catch (e) {
        console.error(`Error capturing ${sc.name}:`, e.message);
    }
});

// Remove temp file
if (fs.existsSync(darkHtmlPath)) {
    fs.unlinkSync(darkHtmlPath);
}
