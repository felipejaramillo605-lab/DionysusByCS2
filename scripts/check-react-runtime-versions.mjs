import fs from 'node:fs';

const packageUrl = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageUrl, 'utf8'));
const react = pkg.dependencies?.react;
const reactDom = pkg.dependencies?.['react-dom'];

if (!react || !reactDom) {
  console.error('react and react-dom must both be declared in dependencies.');
  process.exit(1);
}
if (react !== reactDom) {
  console.error(`React runtime mismatch: react=${react}, react-dom=${reactDom}`);
  process.exit(1);
}
if (/^[~^<>=*]/.test(react) || react.includes('||') || react.includes(' - ')) {
  console.error(`React runtimes must use an exact version, found: ${react}`);
  process.exit(1);
}
console.log(`React runtime versions aligned: ${react}`);
