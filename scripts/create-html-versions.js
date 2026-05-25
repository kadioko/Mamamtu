const fs = require('fs');
const path = require('path');

const docs = [
  { name: 'MAMAMTU_ORG_CONFIG', file: 'MAMAMTU_ORG_CONFIG.md', title: 'MamaMtu Organization Configuration' },
  { name: 'TANZANIA_GRANT_TEMPLATES', file: 'TANZANIA_GRANT_TEMPLATES.md', title: 'Tanzania Grant Application Templates' },
  { name: 'DOCTOR_WELCOME_PACKAGE', file: 'DOCTOR_WELCOME_PACKAGE.md', title: 'Doctor Welcome Package' },
  { name: 'TANZANIA_PILOT_CLINICS', file: 'TANZANIA_PILOT_CLINICS.md', title: 'Tanzania Pilot Clinic Outreach Guide' }
];

function simpleMarkdownToHtml(md) {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\[ \] (.*$)/gim, '☐ $1')
    .replace(/^\[x\] (.*$)/gim, '☑ $1')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^```[\s\S]*?^```$/gm, (m) => '<pre>' + m.slice(3, -3).trim() + '</pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/---+/g, '<hr>')
    .replace(/^(?!<[hl]|<pre|<li|<hr)(.+)$/gm, '<p>$1</p>')
    .replace(/<li>(.*?)<\/li>/gs, (m) => '<ul>' + m + '</ul>')
    .replace(/<\/ul>\s*<ul>/g, '');
}

docs.forEach(doc => {
  try {
    const md = fs.readFileSync(path.join('docs', doc.file), 'utf8');
    const content = simpleMarkdownToHtml(md);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 28px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; font-size: 22px; }
    h3 { color: #4b5563; margin-top: 25px; font-size: 18px; }
    h4 { color: #6b7280; margin-top: 20px; font-size: 16px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; font-family: Consolas, monospace; }
    pre { background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; font-size: 0.85em; }
    li { margin: 8px 0; }
    ul { margin: 15px 0; padding-left: 25px; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; }
    a { color: #2563eb; text-decoration: none; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 0.9em; }
    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
    strong { color: #1f2937; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { border: none; margin-bottom: 5px; }
    .meta { color: #6b7280; font-size: 0.9em; }
    @media print { body { max-width: none; } h2 { page-break-after: avoid; } table { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${doc.title}</h1>
    <p class="meta">MamaMtu by Necuva Group Limited • ${new Date().toLocaleDateString()}</p>
    <p class="meta">P.O. Box 6972, Dar es Salaam, Tanzania • +255 743 910 580</p>
  </div>
  ${content}
</body>
</html>`;

    fs.writeFileSync(path.join('docs/pdfs', doc.name + '.html'), html);
    console.log('✓ Created: docs/pdfs/' + doc.name + '.html');
  } catch(e) {
    console.log('✗ Error with ' + doc.name + ': ' + e.message);
  }
});

console.log('\n📁 HTML versions created in: docs/pdfs/');
console.log('\n📄 Files generated:');
docs.forEach(d => console.log('   • ' + d.name + '.html'));
console.log('\n🖨️  To create PDFs:');
console.log('   1. Open each HTML file in Chrome/Edge');
console.log('   2. Press Ctrl+P');
console.log('   3. Select "Save as PDF"');
console.log('   4. Choose "A4" paper size');
