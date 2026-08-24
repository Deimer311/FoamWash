const fs = require('fs');
const path = require('path');

function getDepth(filePath) {
    const relative = path.relative(path.join(process.cwd(), 'src'), filePath);
    const parts = relative.split(path.sep);
    const depth = parts.length - 1;
    if (depth <= 0) return './';
    return '../'.repeat(depth);
}

function processAllFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') processAllFiles(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            const prefix = getDepth(fullPath);

            if (content.includes('RolesGuard') && !content.includes('import { RolesGuard }')) {
                content = `import { RolesGuard } from '${prefix}common/guards/roles.guard';\n` + content;
            }
            if (content.includes('@Roles(') && !content.includes('import { Roles }')) {
                content = `import { Roles } from '${prefix}common/decorators/roles.decorator';\n` + content;
            }

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Restored imports in', fullPath);
            }
        }
    });
}
processAllFiles(path.join(process.cwd(), 'src'));
