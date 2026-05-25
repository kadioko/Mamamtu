#!/usr/bin/env node
/**
 * Generate PDFs from markdown documentation files
 * Usage: node scripts/generate-pdfs.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DOCS_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'pdfs');

// Documents ready for PDF generation
const DOCUMENTS = [
  {
    name: 'MAMAMTU_ORG_CONFIG',
    file: 'MAMAMTU_ORG_CONFIG.md',
    title: 'MamaMtu Organization Configuration',
    description: 'Complete organization details for grants and compliance'
  },
  {
    name: 'TANZANIA_GRANT_TEMPLATES',
    file: 'TANZANIA_GRANT_TEMPLATES.md',
    title: 'Tanzania Grant Application Templates',
    description: 'Ready-to-submit COSTECH and other grant applications'
  },
  {
    name: 'DOCTOR_WELCOME_PACKAGE',
    file: 'DOCTOR_WELCOME_PACKAGE.md',
    title: 'Doctor Welcome Package',
    description: 'Complete onboarding kit for pilot clinic partners'
  },
  {
    name: 'TANZANIA_PILOT_CLINICS',
    file: 'TANZANIA_PILOT_CLINICS.md',
    title: 'Tanzania Pilot Clinic Outreach Guide',
    description: 'Target clinics, email templates, and outreach strategy'
  }
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✓ Created PDF output directory');
}

// Check for markdown-pdf or install it
function checkDependencies() {
  try {
    require.resolve('markdown-pdf');
    return true;
  } catch (e) {
    console.log('⚠ markdown-pdf not found. Installing...');
    try {
      execSync('npm install markdown-pdf --save-dev', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
      return true;
    } catch (err) {
      console.error('✗ Failed to install markdown-pdf');
      return false;
    }
  }
}

// Generate PDF from markdown
async function generatePDF(doc) {
  const markdownPdf = require('markdown-pdf');
  const inputPath = path.join(DOCS_DIR, doc.file);
  const outputPath = path.join(OUTPUT_DIR, `${doc.name}.pdf`);

  if (!fs.existsSync(inputPath)) {
    console.error(`✗ File not found: ${doc.file}`);
    return false;
  }

  return new Promise((resolve, reject) => {
    markdownPdf({
      paperFormat: 'A4',
      paperOrientation: 'portrait',
      paperBorder: '1cm',
      remarkable: {
        html: true,
        breaks: true
      }
    })
    .from(inputPath)
    .to(outputPath, () => {
      console.log(`✓ Generated: ${doc.name}.pdf`);
      console.log(`  → ${outputPath}`);
      resolve(true);
    })
    .on('error', (err) => {
      console.error(`✗ Failed to generate ${doc.name}.pdf:`, err.message);
      reject(err);
    });
  });
}

// Alternative: Use pandoc if available
function generateWithPandoc(doc) {
  const inputPath = path.join(DOCS_DIR, doc.file);
  const outputPath = path.join(OUTPUT_DIR, `${doc.name}.pdf`);

  if (!fs.existsSync(inputPath)) {
    console.error(`✗ File not found: ${doc.file}`);
    return false;
  }

  try {
    execSync(`pandoc "${inputPath}" -o "${outputPath}" --pdf-engine=xelatex -V geometry:margin=1in`, {
      stdio: 'pipe'
    });
    console.log(`✓ Generated: ${doc.name}.pdf (via pandoc)`);
    return true;
  } catch (err) {
    return false;
  }
}

// Escape HTML special characters
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Apply inline markdown (bold, italic, code, links) to a text string
function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/<(https?:[^\s>]+)>/g, '<a href="$1">$1</a>')
    .replace(/<([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})>/g, '<a href="mailto:$1">$1</a>');
}

// Convert markdown to HTML with proper table, list, code block support
function markdownToHTML(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      out.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>${codeLines.join('\n')}</code></pre>`);
      i++;
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineMarkdown(hMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push('<hr>');
      i++;
      continue;
    }

    // Table: collect all consecutive table lines
    if (/^\|/.test(line)) {
      const tableLines = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      // Row 0 = header, row 1 = separator (skip), rows 2+ = body
      const rows = tableLines.filter((_, idx) => idx !== 1);
      const parseRow = (r) => r.replace(/^\||\|$/g, '').split('|').map(c => inlineMarkdown(c.trim()));
      out.push('<table>');
      if (rows.length > 0) {
        out.push('<thead><tr>');
        parseRow(rows[0]).forEach(cell => out.push(`<th>${cell}</th>`));
        out.push('</tr></thead>');
      }
      if (rows.length > 1) {
        out.push('<tbody>');
        rows.slice(1).forEach(row => {
          out.push('<tr>');
          parseRow(row).forEach(cell => out.push(`<td>${cell}</td>`));
          out.push('</tr>');
        });
        out.push('</tbody>');
      }
      out.push('</table>');
      continue;
    }

    // Unordered list: collect consecutive list items
    if (/^[-*]\s/.test(line) || /^\[ \]\s/.test(line) || /^\[x\]\s/.test(line)) {
      out.push('<ul>');
      while (i < lines.length && (/^[-*]\s/.test(lines[i]) || /^\[[ x]\]\s/.test(lines[i]))) {
        const l = lines[i];
        if (/^\[x\]\s/.test(l)) {
          out.push(`<li><input type="checkbox" checked disabled> ${inlineMarkdown(l.replace(/^\[x\]\s/, ''))}</li>`);
        } else if (/^\[ \]\s/.test(l)) {
          out.push(`<li><input type="checkbox" disabled> ${inlineMarkdown(l.replace(/^\[ \]\s/, ''))}</li>`);
        } else {
          out.push(`<li>${inlineMarkdown(l.replace(/^[-*]\s/, ''))}</li>`);
        }
        i++;
      }
      out.push('</ul>');
      continue;
    }

    // Ordered list: collect consecutive ordered items
    if (/^\d+\.\s/.test(line)) {
      out.push('<ol>');
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        out.push(`<li>${inlineMarkdown(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push('</ol>');
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    out.push(`<p>${inlineMarkdown(line)}</p>`);
    i++;
  }

  return out.join('\n');
}

// Create an HTML version as fallback
function generateHTML(doc) {
  const inputPath = path.join(DOCS_DIR, doc.file);
  const outputPath = path.join(OUTPUT_DIR, `${doc.name}.html`);

  if (!fs.existsSync(inputPath)) {
    return false;
  }

  const markdown = fs.readFileSync(inputPath, 'utf8');
  const bodyHTML = markdownToHTML(markdown);

  const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${doc.title}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; font-size: 28px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; font-size: 22px; page-break-after: avoid; }
    h3 { color: #4b5563; margin-top: 25px; font-size: 18px; }
    h4 { color: #6b7280; margin-top: 20px; font-size: 16px; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; font-family: Consolas, monospace; }
    pre { background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; font-size: 0.85em; margin: 15px 0; }
    pre code { background: none; padding: 0; }
    p { margin: 10px 0; }
    li { margin: 8px 0; }
    ul, ol { margin: 15px 0; padding-left: 25px; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; }
    a { color: #2563eb; text-decoration: none; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 0.9em; page-break-inside: avoid; }
    th, td { border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; color: #111827; }
    tr:nth-child(even) { background: #f9fafb; }
    strong { color: #1f2937; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { border: none; margin-bottom: 5px; }
    .meta { color: #6b7280; font-size: 0.9em; }
    @media print { body { max-width: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${doc.title}</h1>
    <p class="meta">MamaMtu by Necuva Group Limited &bull; ${new Date().toLocaleDateString()}</p>
    <p class="meta">P.O. Box 6972, Dar es Salaam, Tanzania &bull; +255 743 910 580</p>
  </div>
  ${bodyHTML}
</body>
</html>`;

  fs.writeFileSync(outputPath, fullHTML);
  console.log(`✓ Generated: ${doc.name}.html`);
  return true;
}

// Main execution
async function main() {
  console.log('📄 Generating PDFs from Markdown Documentation\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  let hasPandoc = false;
  try {
    execSync('pandoc --version', { stdio: 'pipe' });
    hasPandoc = true;
    console.log('✓ Using pandoc for PDF generation\n');
  } catch (e) {
    console.log('⚠ Pandoc not found, will try markdown-pdf\n');
  }

  let successCount = 0;

  for (const doc of DOCUMENTS) {
    console.log(`\n📄 Processing: ${doc.file}`);
    console.log(`   Title: ${doc.title}`);

    try {
      if (hasPandoc) {
        if (generateWithPandoc(doc)) {
          successCount++;
          continue;
        }
      }

      // Try markdown-pdf
      if (checkDependencies()) {
        await generatePDF(doc);
        successCount++;
      } else {
        // Fallback to HTML
        generateHTML(doc);
        successCount++;
      }
    } catch (err) {
      // Fallback to HTML
      generateHTML(doc);
      successCount++;
    }
  }

  console.log(`\n✅ Completed: ${successCount}/${DOCUMENTS.length} documents generated`);
  console.log(`📁 Output location: ${OUTPUT_DIR}\n`);

  // List generated files
  const files = fs.readdirSync(OUTPUT_DIR);
  if (files.length > 0) {
    console.log('Generated files:');
    files.forEach(f => {
      const stats = fs.statSync(path.join(OUTPUT_DIR, f));
      console.log(`  • ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DOCUMENTS, generatePDF, generateHTML };
