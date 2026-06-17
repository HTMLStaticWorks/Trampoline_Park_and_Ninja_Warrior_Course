const fs = require('fs');
const path = require('path');

const directory = __dirname;

const dashboardCss = `
/* Dashboard Layout Updates */
.dashboard-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: calc(100vh - 80px);
  max-width: 1500px;
  margin: 0 auto;
}
.dashboard-sidebar {
  background-color: var(--glass-bg);
  border-right: 1px solid var(--glass-border);
  padding: 2rem;
  display: flex;
  flex-direction: column;
}
.dashboard-user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--glass-border);
}
.dashboard-user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-family: var(--font-heading);
  color: #fff;
  font-size: 1.25rem;
}
.dashboard-user-info h4 {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}
.dashboard-user-info p {
  font-size: 0.8rem;
  color: var(--secondary);
}
.dashboard-menu {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dashboard-menu-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition);
}
.dashboard-menu-link:hover, .dashboard-menu-link.active {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.dashboard-menu-link.active {
  background-color: var(--primary-glow);
  border: 1px solid var(--primary);
}
.dashboard-content {
  padding: 3rem 4rem;
}
.dashboard-section {
  display: none;
  animation: fadeInUp 0.4s ease forwards;
}
.dashboard-section.active {
  display: block;
}
.dash-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.dash-stat-card {
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}
.dash-stat-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.dash-stat-val {
  font-size: 2rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--text-primary);
}
@media (max-width: 1024px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }
  .dashboard-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--glass-border);
  }
  .dashboard-content {
    padding: 2rem;
  }
}
`;

function run() {
  // 1. Update CSS
  const cssPath = path.join(directory, 'assets', 'css', 'style.css');
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  if (!cssContent.includes('.dashboard-container {')) {
    fs.appendFileSync(cssPath, dashboardCss, 'utf8');
  }

  // 2. Global HTML link updates
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove Jump Passes & Memberships links (handling <li> tags and their contents)
    content = content.replace(/<li[^>]*>\s*<a[^>]*href="passes\.html"[^>]*>Jump Passes<\/a>\s*<\/li>/gi, '');
    content = content.replace(/<li[^>]*>\s*<a[^>]*href="memberships\.html"[^>]*>Memberships<\/a>\s*<\/li>/gi, '');

    // Rename About Us to About
    content = content.replace(/>About Us<\/a>/gi, '>About</a>');

    if (file === 'dashboard.html') {
      // Remove dashboard sidebar items
      content = content.replace(/<li[^>]*>\s*<a[^>]*data-section="dash-passes"[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, '');
      content = content.replace(/<li[^>]*>\s*<a[^>]*data-section="dash-memberships"[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, '');

      // The sections in dashboard.html are huge, using simple string replacements or Regex to delete them is hard.
      // Instead, we will do it via dashboard.js dynamically, OR we can remove them using a slightly advanced regex if possible,
      // but to be safe, we'll leave the HTML sections orphaned and let them just stay hidden. 
      // Actually, removing them is cleaner. Let's try to remove everything between <!-- SUBSECTION: PASSES --> and <!-- SUBSECTION: WAIVERS -->
      const passesSectionRegex = /<!-- SUBSECTION: PASSES -->[\s\S]*?<!-- SUBSECTION: WAIVERS -->/i;
      content = content.replace(passesSectionRegex, '<!-- SUBSECTION: WAIVERS -->');

      const memSectionRegex = /<!-- SUBSECTION: MEMBERSHIPS -->[\s\S]*?<!-- SUBSECTION: SETTINGS -->/i;
      content = content.replace(memSectionRegex, '<!-- SUBSECTION: SETTINGS -->');

      // Also fix the missing AOS and ScrollTop in dashboard.html
      const bodyEndInjections = `
  <button id="scrollTopBtn" class="scroll-top-btn" aria-label="Scroll to top" title="Scroll to top">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:24px; height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
  </button>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script src="assets/js/main.js"></script>
  <script src="assets/js/dashboard.js"></script>
</body>`;
      if (!content.includes('<script src="https://unpkg.com/aos@2.3.1/dist/aos.js">')) {
        content = content.replace(/<script src="assets\/js\/main\.js"><\/script>\s*<script src="assets\/js\/dashboard\.js"><\/script>\s*<\/body>/ig, bodyEndInjections);
      }
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });

  // 3. Delete the files
  const filesToDelete = ['passes.html', 'memberships.html'];
  filesToDelete.forEach(f => {
    const p = path.join(directory, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  });

  // 4. Update dashboard.js
  const dashJsPath = path.join(directory, 'assets', 'js', 'dashboard.js');
  if (fs.existsSync(dashJsPath)) {
    let jsContent = fs.readFileSync(dashJsPath, 'utf8');
    let origJs = jsContent;

    // Remove the render references in the click listener
    jsContent = jsContent.replace(/} else if \(targetSectionId === 'dash-passes'\) {[\s\S]*?renderPasses\(\);/g, '');
    jsContent = jsContent.replace(/} else if \(targetSectionId === 'dash-memberships'\) {[\s\S]*?renderMemberships\(\);/g, '');
    
    if (jsContent !== origJs) {
      fs.writeFileSync(dashJsPath, jsContent, 'utf8');
    }
  }

  console.log("Update completed.");
}

run();
