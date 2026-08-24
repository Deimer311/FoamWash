const fs = require('node:fs');
const path = require('node:path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function processFiles() {
    const files = getAllFiles(srcDir);
    let totalFixes = 0;

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf-8');
        let initialContent = content;

        // Fix: Prefer Number.parseInt over parseInt
        content = content.replace(/(?<!\.)\bparseInt\b\(/g, 'Number.parseInt(');

        // Fix: Add explicit "type" attribute to this button
        // Match <button ...> but not <button type="..."
        // This is a simple regex that adds type="button" if not present
        content = content.replace(/<button(?![^>]*\btype=)([^>]*)>/g, '<button type="button"$1>');

        // Fix: Anchor used as a button (add role="button" to anchors without href)
        content = content.replace(/<a(?![^>]*\bhref=)([^>]*)>/g, '<a role="button" tabIndex={0}$1>');

        // Fix: Non-native interactive elements (add role="button" and tabIndex={0} to div/span/i with onClick)
        // Note: This is rudimentary but catches common ones.
        content = content.replace(/<(div|span|i|p)(?![^>]*\brole=)([^>]*\bonClick=[^>]*)>/g, '<$1 role="button" tabIndex={0}$2>');

        if (content !== initialContent) {
            fs.writeFileSync(file, content, 'utf-8');
            totalFixes++;
            console.log(`Fixed issues in: ${path.basename(file)}`);
        }
    });

    console.log(`\nApplied automatic fixes to ${totalFixes} files.`);
}

processFiles();
