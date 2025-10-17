#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const Babel = require('../build-tools/babel-standalone.min.js');

const SRC_DIR = path.resolve(__dirname, '../src');
const DIST_DIR = path.resolve(__dirname, '../dist');

const BABEL_OPTIONS = {
  presets: [
    ['env', { targets: { esmodules: true }, modules: false }],
    ['react', { runtime: 'classic', development: false }]
  ],
  sourceType: 'module',
  ast: false,
  babelrc: false,
  configFile: false
};

const JS_EXTENSIONS = new Set(['.js', '.jsx']);

const shouldSkip = filePath => {
  const relative = path.relative(SRC_DIR, filePath);
  if (relative.startsWith('vendor' + path.sep)) {
    return true;
  }
  return false;
};

const ensureDir = dirPath => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const normalizeImports = code => code.replace(/\.(jsx)(['\"])/g, '.js$2');

const transformFile = (filePath, relativePath) => {
  if (shouldSkip(filePath)) {
    return;
  }

  const source = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  const outputPath = path.join(DIST_DIR, relativePath.replace(/\.jsx$/, '.js'));
  ensureDir(path.dirname(outputPath));

  if (JS_EXTENSIONS.has(ext)) {
    const result = Babel.transform(source, BABEL_OPTIONS);
    const normalized = normalizeImports(result.code);
    fs.writeFileSync(outputPath, normalized, 'utf8');
  } else {
    fs.writeFileSync(outputPath, source, 'utf8');
  }
};

const walk = (dir, prefix = '') => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    const entryPath = path.join(dir, entry.name);
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, relativePath);
    } else {
      transformFile(entryPath, relativePath);
    }
  });
};

const cleanDist = () => {
  if (!fs.existsSync(DIST_DIR)) {
    return;
  }

  const removeRecursive = target => {
    if (fs.statSync(target).isDirectory()) {
      fs.readdirSync(target).forEach(child => removeRecursive(path.join(target, child)));
      fs.rmdirSync(target);
    } else {
      fs.unlinkSync(target);
    }
  };

  fs.readdirSync(DIST_DIR).forEach(entry => removeRecursive(path.join(DIST_DIR, entry)));
};

const main = () => {
  cleanDist();
  ensureDir(DIST_DIR);
  walk(SRC_DIR);
  console.log('Build completed successfully.');
};

if (require.main === module) {
  main();
}
