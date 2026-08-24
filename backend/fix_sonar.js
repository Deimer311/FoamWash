const fs = require('fs');
const path = require('path');

const testDir = 'src/test/pruebas unitarias';
const files = fs.readdirSync(testDir).filter(f => f.match(/^\d{2}_.*\.spec\.ts$/));

let totalReplaced = 0;

files.forEach(file => {
    const filePath = path.join(testDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const regex = /it\(\s*(['"`].*?['"`])\s*,\s*\(\)\s*=>\s*\{\s*expect\(true\)\.toBe\(true\);\s*\}\);/g;
    
    let replacedCount = 0;
    const newContent = content.replace(regex, (match, stringArg) => {
        replacedCount++;
        return `it.todo(${stringArg});`;
    });
    
    if (replacedCount > 0) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated ${file}: converted ${replacedCount} dummy tests to it.todo()`);
        totalReplaced += replacedCount;
    }
});

console.log(`Total replaced: ${totalReplaced}`);
