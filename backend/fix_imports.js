const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'test', 'pruebas unitarias');

const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/from '\.\.\//g, "from '../../");
    fs.writeFileSync(filePath, content);
  }
}
console.log('Fixed imports');
