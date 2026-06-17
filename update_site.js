const fs = require('fs');
const path = require('path');

const directory = __dirname;

const cssAdditions = `
/* === NEW UPDATES === */

/* Dropdown Navigation */
.dropdown {
  position: relative;
}
.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.dropdown-arrow {
  font-size: 0.7em;
  transition: transform 0.3s;
}
.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px 0 var(--glass-shadow);
  border-radius: var(--radius-md);
  list-style: none;
  min-width: 150px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  z-index: 1050;
}
.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.dropdown-item {
  display: block;
  padding: 0.5rem 1.25rem;
  color: var(--text-secondary);
  font-weight: var(--weight-nav);
  transition: all 0.2s;
}
.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--secondary);
}

/* Header Actions Adjustments */
.rtl-toggle, .dashboard-icon {
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}
.rtl-toggle:hover, .dashboard-icon:hover {
  border-color: var(--primary);
  color: var(--text-primary);
}

/* Scroll To Top Button */
.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 15px var(--primary-glow);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 999;
}
.scroll-top-btn.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.scroll-top-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px var(--secondary-glow);
}

/* RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
[dir="rtl"] .nav-menu {
  margin-right: auto;
  margin-left: 0;
}
[dir="rtl"] .dropdown-menu {
  right: 0;
  left: auto;
}
[dir="rtl"] .contact-item svg {
  margin-left: 0.75rem;
  margin-right: 0;
}
[dir="rtl"] .mobile-nav {
  right: auto;
  left: -100%;
  border-left: none;
  border-right: 1px solid var(--glass-border);
}
[dir="rtl"] .mobile-nav.open {
  left: 0;
}
`;

const jsAdditions = `

/* === NEW UPDATES === */
document.addEventListener('DOMContentLoaded', () => {
  initRTL();
  initScrollTop();
  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 50
    });
  }
});

function initRTL() {
  const rtlToggle = document.getElementById('rtlToggleBtn');
  if (!rtlToggle) return;
  
  // Check local storage
  const isRTL = localStorage.getItem('rtl') === 'true';
  if (isRTL) {
    document.documentElement.setAttribute('dir', 'rtl');
  }
  
  rtlToggle.addEventListener('click', () => {
    const currentDir = document.documentElement.getAttribute('dir');
    if (currentDir === 'rtl') {
      document.documentElement.removeAttribute('dir');
      localStorage.setItem('rtl', 'false');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem('rtl', 'true');
    }
  });
}

function initScrollTop() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });
  
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
`;

function updateCssJs() {
  const cssPath = path.join(directory, 'assets', 'css', 'style.css');
  let cssContent = fs.readFileSync(cssPath, 'utf8');
  if (!cssContent.includes('/* === NEW UPDATES === */')) {
    fs.appendFileSync(cssPath, cssAdditions, 'utf8');
  }

  const jsPath = path.join(directory, 'assets', 'js', 'main.js');
  let jsContent = fs.readFileSync(jsPath, 'utf8');
  if (!jsContent.includes('/* === NEW UPDATES === */')) {
    fs.appendFileSync(jsPath, jsAdditions, 'utf8');
  }
}

function updateHtmlFiles() {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.html'));

  files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Head injections
    const headInjections = `
  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <meta name="keywords" content="trampoline, ninja warrior, birthday party, fun, entertainment">
  <meta name="author" content="GravityForce">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
</head>`;
    if (!content.includes('<link rel="icon"')) {
      content = content.replace('</head>', headInjections);
    }

    // 2. Desktop Nav Home Dropdown
    const navPattern1 = /<li><a href="index\.html" class="nav-link active">Home<\/a><\/li>/g;
    const navPattern2 = /<li><a href="index\.html" class="nav-link">Home<\/a><\/li>/g;
    const dropdownHtmlActive = `<li class="dropdown">
            <a href="index.html" class="nav-link active dropdown-toggle">Home <span class="dropdown-arrow">▼</span></a>
            <ul class="dropdown-menu">
              <li><a href="index.html" class="dropdown-item">Home 1</a></li>
              <li><a href="index.html" class="dropdown-item">Home 2</a></li>
            </ul>
          </li>`;
    const dropdownHtmlInactive = `<li class="dropdown">
            <a href="index.html" class="nav-link dropdown-toggle">Home <span class="dropdown-arrow">▼</span></a>
            <ul class="dropdown-menu">
              <li><a href="index.html" class="dropdown-item">Home 1</a></li>
              <li><a href="index.html" class="dropdown-item">Home 2</a></li>
            </ul>
          </li>`;

    content = content.replace(navPattern1, dropdownHtmlActive);
    content = content.replace(navPattern2, dropdownHtmlInactive);

    // Mobile Nav Dropdown update
    const mobPattern1 = /<li><a href="index\.html" class="mobile-nav-link active">Home<\/a><\/li>/g;
    const mobPattern2 = /<li><a href="index\.html" class="mobile-nav-link">Home<\/a><\/li>/g;
    const mobDropdownActive = `<li><a href="index.html" class="mobile-nav-link active">Home 1</a></li>
        <li><a href="index.html" class="mobile-nav-link">Home 2</a></li>`;
    const mobDropdownInactive = `<li><a href="index.html" class="mobile-nav-link">Home 1</a></li>
        <li><a href="index.html" class="mobile-nav-link">Home 2</a></li>`;

    if (!content.includes('>Home 1</a>')) {
      content = content.replace(mobPattern1, mobDropdownActive);
      content = content.replace(mobPattern2, mobDropdownInactive);
    }

    // 3. Header Actions Re-order and Replace
    if (content.includes('id="bookPassBtn"')) {
      content = content.replace(/<a href="dashboard\.html" class="btn btn-primary" id="bookPassBtn">Book Jump Pass<\/a>/g, '');
    }

    if (!content.includes('rtl-toggle')) {
      const injection = `<button class="theme-toggle" id="themeToggleBtn" aria-label="Toggle light/dark theme">
          <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 117.071 7.071 5 5 0 01-7.071-7.071z" />
          </svg>
        </button>
        <button class="rtl-toggle" id="rtlToggleBtn" aria-label="Toggle RTL layout" title="RTL Toggle">
          <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
        <a href="dashboard.html" class="dashboard-icon" aria-label="Dashboard" title="Dashboard">
          <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </a>`;
      content = content.replace(/<button class="theme-toggle"([^>]*?)>([\s\S]*?)<\/button>/i, injection);
    }

    // Re-order Login button to be last inside header-actions
    const loginBtn = /<a href="login\.html" class="btn btn-secondary" id="loginBtn">Login<\/a>\s*/g;
    if (loginBtn.test(content)) {
      content = content.replace(loginBtn, '');
      content = content.replace(/(<button class="hamburger"[^>]*?>[\s\S]*?<\/button>\s*)<\/div>/i, '$1  <a href="login.html" class="btn btn-secondary" id="loginBtn">Login</a>\n      </div>');
    }

    // 4. Body Ends - Inject AOS JS, Scroll Top
    const bodyEndInjections = `
  <button id="scrollTopBtn" class="scroll-top-btn" aria-label="Scroll to top" title="Scroll to top">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:24px; height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
  </button>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script src="assets/js/main.js"></script>
</body>`;

    if (!content.includes('<script src="https://unpkg.com/aos@2.3.1/dist/aos.js">')) {
      content = content.replace(/<script src="assets\/js\/main\.js"><\/script>\s*<\/body>/ig, bodyEndInjections);
    }

    // 5. Inject AOS tags to <section>
    content = content.replace(/(<section\s+class="[^"]+")/g, '$1 data-aos="fade-up"');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

updateCssJs();
updateHtmlFiles();
console.log("Successfully updated all HTML, CSS, and JS files.");
