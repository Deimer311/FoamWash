const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'test', 'pruebas unitarias');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.spec.ts'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Reverse the mojibake
    const buffer = Buffer.from(content, 'latin1');
    const fixedContent = buffer.toString('utf8');
    
    if (fixedContent !== content) {
       fs.writeFileSync(filePath, fixedContent, 'utf8');
       console.log('Fixed', file);
    }
  } catch (e) {
    console.error('Error fixing', file, e);
  }
}
