import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const domainRoot = path.join(root, 'src', 'domain');
const forbidden = [
  /from\s+['"]react(?:\/[^'"]*)?['"]/,
  /from\s+['"][^'"]*components[^'"]*['"]/,
  /from\s+['"][^'"]*context[^'"]*['"]/,
  /from\s+['"][^'"]*infrastructure[^'"]*['"]/,
  /from\s+['"]@supabase\/[^'"]*['"]/,
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const violations = [];
for (const file of walk(domainRoot).filter(file => /\.(ts|tsx|js|jsx)$/.test(file))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const rule of forbidden) {
    if (rule.test(source)) violations.push(`${path.relative(root, file)} violates ${rule}`);
  }
}

if (violations.length) {
  console.error('Architecture boundary violations:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('Architecture boundaries validated: domain layer is framework-independent.');
