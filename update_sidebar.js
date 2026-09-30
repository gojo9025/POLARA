const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace sidebar background
css = css.replace(/(\.sidebar\s*\{[\s\S]*?background:\s*)var\(--bg-secondary\);/g, '$1#0a192f;');

// Sidebar header bg
css = css.replace(/(\.sidebar-header\s*\{[\s\S]*?background:\s*)rgba\(255,\s*255,\s*255,\s*0\.5\);/g, '$1#0a192f;');

// Sidebar bottom border
css = css.replace(/border-right:\s*1px\s*solid\s*var\(--border-secondary\);/g, 'border-right: 1px solid #1e2d4d;');
css = css.replace(/border-bottom:\s*1px\s*solid\s*var\(--border-secondary\);/g, 'border-bottom: 1px solid #1e2d4d;');
css = css.replace(/border-top:\s*1px\s*solid\s*var\(--border-secondary\);/g, 'border-top: 1px solid #1e2d4d;');

// Sidebar text colors
css = css.replace(/(\.sidebar-logo\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.sidebar-logo-name\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.sidebar-logo-subtitle\s*\{[\s\S]*?color:\s*)var\(--text-tertiary\);/g, '$1#94a3b8;');
css = css.replace(/(\.sidebar-section-label\s*\{[\s\S]*?color:\s*)var\(--text-muted\);/g, '$1#64748b;');

// Sidebar nav links
css = css.replace(/(\.nav-link-wrapper\s*\{[\s\S]*?color:\s*)var\(--text-secondary\);/g, '$1#cbd5e1;');
css = css.replace(/(\.nav-link-wrapper:hover\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.nav-link-wrapper:hover\s*\{[\s\S]*?background:\s*)var\(--bg-surface\);/g, '$1#1e2d4d;');
css = css.replace(/(\.nav-link-wrapper:hover\s*\{[\s\S]*?border-color:\s*)var\(--border-primary\);/g, '$1transparent;');

css = css.replace(/(\.nav-link-wrapper\.active\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.nav-link-wrapper\.active\s*\{[\s\S]*?background:\s*)rgba\(33,\s*153,\s*204,\s*0\.1\);/g, '$1#1e2d4d;');
css = css.replace(/(\.nav-link-wrapper\.active\s*\{[\s\S]*?border-color:\s*)rgba\(33,\s*153,\s*204,\s*0\.2\);/g, '$1transparent;');

css = css.replace(/(\.icon-wrap\s*\{[\s\S]*?color:\s*)var\(--text-tertiary\);/g, '$1#94a3b8;');
css = css.replace(/(\.nav-link-wrapper:hover\s*\.icon-wrap\s*\{[\s\S]*?color:\s*)var\(--text-secondary\);/g, '$1#ffffff;');
css = css.replace(/(\.nav-link-wrapper\.active\s*\.icon-wrap\s*\{[\s\S]*?color:\s*)var\(--ice-600\);/g, '$1#38b6e6;');

// Sidebar footer text
css = css.replace(/(\.sidebar-user-name\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.sidebar-user-role\s*\{[\s\S]*?color:\s*)var\(--text-tertiary\);/g, '$1#94a3b8;');
css = css.replace(/(\.sidebar-logout\s*\{[\s\S]*?color:\s*)var\(--text-secondary\);/g, '$1#cbd5e1;');
css = css.replace(/(\.sidebar-logout:hover\s*\{[\s\S]*?color:\s*)var\(--danger-500\);/g, '$1#f87171;');
css = css.replace(/(\.sidebar-logout:hover\s*\{[\s\S]*?background:\s*)rgba\(239,\s*68,\s*68,\s*0\.1\);/g, '$1rgba(248,113,113,0.1);');
css = css.replace(/(\.sidebar-login-btn\s*\{[\s\S]*?color:\s*)var\(--text-primary\);/g, '$1#ffffff;');
css = css.replace(/(\.sidebar-login-btn\s*\{[\s\S]*?background:\s*)var\(--bg-surface\);/g, '$1#1e2d4d;');
css = css.replace(/(\.sidebar-login-btn\s*\{[\s\S]*?border-color:\s*)var\(--border-primary\);/g, '$1transparent;');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Sidebar theme updated to dark.');
