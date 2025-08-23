const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// HTML template for the PDF
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Malinta Connect - System Documentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 12px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 18px;
            color: #64748b;
            font-weight: 400;
        }
        
        .header .date {
            font-size: 14px;
            color: #94a3b8;
            margin-top: 10px;
        }
        
        .toc {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
        }
        
        .toc h2 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .toc ol {
            margin-left: 20px;
        }
        
        .toc li {
            margin-bottom: 8px;
            color: #475569;
        }
        
        .toc a {
            color: #2563eb;
            text-decoration: none;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1e40af;
            margin: 30px 0 15px 0;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
        
        h3 {
            font-size: 20px;
            font-weight: 600;
            color: #334155;
            margin: 25px 0 12px 0;
        }
        
        h4 {
            font-size: 16px;
            font-weight: 500;
            color: #475569;
            margin: 20px 0 10px 0;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin: 12px 0 12px 20px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 11px;
            color: #dc2626;
        }
        
        pre {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            margin: 15px 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: #334155;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .feature-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        
        .feature-card h4 {
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .flow-step {
            background: #f0f9ff;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #0ea5e9;
        }
        
        .flow-step .step-number {
            font-weight: 600;
            color: #0369a1;
            margin-bottom: 5px;
        }
        
        .interface-example {
            background: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #f59e0b;
            margin: 15px 0;
        }
        
        .interface-example h4 {
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .security-feature {
            background: #dcfce7;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #16a34a;
        }
        
        .security-feature h4 {
            color: #166534;
            margin-bottom: 5px;
        }
        
        .tech-stack {
            background: #f3e8ff;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #a855f7;
            margin: 15px 0;
        }
        
        .tech-stack h4 {
            color: #7c3aed;
            margin-bottom: 10px;
        }
        
        .conclusion {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #16a34a;
            margin: 30px 0;
        }
        
        .conclusion h3 {
            color: #166534;
            margin-bottom: 15px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 11px;
        }
        
        @media print {
            body {
                font-size: 11px;
            }
            
            .container {
                padding: 20px;
            }
            
            h2 {
                page-break-after: avoid;
            }
            
            h3 {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Malinta Connect</h1>
            <div class="subtitle">Comprehensive System Documentation</div>
            <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
        </div>
        
        <div class="toc">
            <h2>Table of Contents</h2>
            <ol>
                <li><a href="#system-overview">System Overview</a></li>
                <li><a href="#architecture-technology-stack">Architecture & Technology Stack</a></li>
                <li><a href="#core-features">Core Features</a></li>
                <li><a href="#user-roles-permissions">User Roles & Permissions</a></li>
                <li><a href="#user-flows-workflows">User Flows & Workflows</a></li>
                <li><a href="#database-design">Database Design</a></li>
                <li><a href="#api-server-actions">API & Server Actions</a></li>
                <li><a href="#security-features">Security Features</a></li>
                <li><a href="#integration-external-services">Integration & External Services</a></li>
                <li><a href="#performance-scalability">Performance & Scalability</a></li>
                <li><a href="#testing-quality-assurance">Testing & Quality Assurance</a></li>
                <li><a href="#deployment-maintenance">Deployment & Maintenance</a></li>
                <li><a href="#future-enhancements">Future Enhancements</a></li>
                <li><a href="#technical-specifications">Technical Specifications</a></li>
                <li><a href="#implementation-status">Implementation Status</a></li>
            </ol>
        </div>
        
        <div id="content">
            <!-- Content will be inserted here -->
        </div>
        
        <div class="footer">
            <p>Malinta Connect System Documentation | Generated for Research Paper | ${new Date().getFullYear()}</p>
        </div>
    </div>
</body>
</html>
`;

// Function to convert markdown to HTML
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h2 id="$1.toLowerCase().replace(/[^a-z0-9]+/g, \'-\')">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```typescript\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gim, '<ol>$1</ol>');
    
    // Paragraphs
    html = html.replace(/^(?!<[h|o|u|p|d|t|s|f|.])/gim, '<p>');
    html = html.replace(/(?<!<\/p>)$/gim, '</p>');
    
    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    // Special formatting for features
    html = html.replace(/<h4>([^<]+)<\/h4>\n<p>([^<]+)<\/p>/g, '<div class="feature-card"><h4>$1</h4><p>$2</p></div>');
    
    // Special formatting for flow steps
    html = html.replace(/<h4>(\d+\. [^<]+)<\/h4>\n<p>([^<]+)<\/p>/g, '<div class="flow-step"><div class="step-number">$1</div><p>$2</p></div>');
    
    // Special formatting for interface examples
    html = html.replace(/<h4>([^<]+)<\/h4>\n<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<div class="interface-example"><h4>$1</h4><pre><code>$2</code></pre></div>');
    
    // Special formatting for security features
    html = html.replace(/<h4>([^<]+)<\/h4>\n<p>([^<]+)<\/p>/g, '<div class="security-feature"><h4>$1</h4><p>$2</p></div>');
    
    // Special formatting for tech stack
    html = html.replace(/<h4>([^<]+)<\/h4>\n<p>([^<]+)<\/p>/g, '<div class="tech-stack"><h4>$1</h4><p>$2</p></div>');
    
    // Conclusion section
    html = html.replace(/<h2>Conclusion<\/h2>/g, '<div class="conclusion"><h3>Conclusion</h3>');
    html = html.replace(/<h3>Key Success Factors<\/h3>/g, '</div><h3>Key Success Factors</h3>');
    
    return html;
}

async function generatePDF() {
    try {
        // Read the markdown file
        const markdownPath = path.join(__dirname, '..', 'SYSTEM_DOCUMENTATION.md');
        const markdownContent = fs.readFileSync(markdownPath, 'utf8');
        
        // Convert markdown to HTML
        const contentHtml = markdownToHtml(markdownContent);
        
        // Create the complete HTML
        const fullHtml = htmlTemplate.replace('<!-- Content will be inserted here -->', contentHtml);
        
        // Write HTML file for debugging
        const htmlPath = path.join(__dirname, '..', 'SYSTEM_DOCUMENTATION.html');
        fs.writeFileSync(htmlPath, fullHtml);
        console.log('HTML file generated:', htmlPath);
        
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set content
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        // Generate PDF
        const pdfPath = path.join(__dirname, '..', 'Malinta_Connect_System_Documentation.pdf');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            },
            printBackground: true,
            displayHeaderFooter: false
        });
        
        console.log('PDF generated successfully:', pdfPath);
        
        await browser.close();
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    }
}

// Run the script
generatePDF();
