const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const styleRegex = /<style\s+jsx>\{`([\s\S]*?)`\}<\/style>/;
  const match = content.match(styleRegex);
  
  if (match) {
    const cssContent = match[1];
    content = content.replace(styleRegex, '');
    if (!content.includes(`import './page.css';`)) {
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLastImport = content.indexOf('\n', lastImportIndex);
        content = content.substring(0, endOfLastImport) + `\nimport './page.css';` + content.substring(endOfLastImport);
      } else {
        content = `import './page.css';\n` + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    const cssPath = path.join(path.dirname(filePath), 'page.css');
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log(`Processed ${filePath} -> Created ${cssPath}`);
  }
}

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    var filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.tsx')) {
      callback(filepath);
    }
  });
}

walkSync(path.join(__dirname, 'src', 'app'), processFile);
console.log('Done extracting styled-jsx!');
