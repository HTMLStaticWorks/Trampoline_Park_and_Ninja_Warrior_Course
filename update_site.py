import os
import glob
import re

directory = r'c:\class\.vscode\tramploine'

css_additions = """
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
"""

js_additions = """

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
"""

def update_css_js():
    # Update CSS
    css_path = os.path.join(directory, 'assets', 'css', 'style.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    if '/* === NEW UPDATES === */' not in css_content:
        with open(css_path, 'a', encoding='utf-8') as f:
            f.write(css_additions)
            
    # Update JS
    js_path = os.path.join(directory, 'assets', 'js', 'main.js')
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
    if '/* === NEW UPDATES === */' not in js_content:
        with open(js_path, 'a', encoding='utf-8') as f:
            f.write(js_additions)

def update_html_files():
    html_files = glob.glob(os.path.join(directory, '*.html'))
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # 1. Favicon, SEO and AOS CSS in Head
        head_injections = '''
  <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <meta name="keywords" content="trampoline, ninja warrior, birthday party, fun, entertainment">
  <meta name="author" content="GravityForce">
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
</head>'''
        if '<link rel="icon"' not in content:
            content = content.replace('</head>', head_injections)
            
        # 2. Desktop Nav Home Dropdown
        nav_pattern1 = r'<li><a href="index\.html" class="nav-link active">Home</a></li>'
        nav_pattern2 = r'<li><a href="index\.html" class="nav-link">Home</a></li>'
        dropdown_html_active = '''<li class="dropdown">
            <a href="index.html" class="nav-link active dropdown-toggle">Home <span class="dropdown-arrow">▼</span></a>
            <ul class="dropdown-menu">
              <li><a href="index.html" class="dropdown-item">Home 1</a></li>
              <li><a href="index.html" class="dropdown-item">Home 2</a></li>
            </ul>
          </li>'''
        dropdown_html_inactive = '''<li class="dropdown">
            <a href="index.html" class="nav-link dropdown-toggle">Home <span class="dropdown-arrow">▼</span></a>
            <ul class="dropdown-menu">
              <li><a href="index.html" class="dropdown-item">Home 1</a></li>
              <li><a href="index.html" class="dropdown-item">Home 2</a></li>
            </ul>
          </li>'''
        
        content = re.sub(nav_pattern1, dropdown_html_active, content)
        content = re.sub(nav_pattern2, dropdown_html_inactive, content)
        
        # Mobile Nav Dropdown update
        mob_pattern1 = r'<li><a href="index\.html" class="mobile-nav-link active">Home</a></li>'
        mob_pattern2 = r'<li><a href="index\.html" class="mobile-nav-link">Home</a></li>'
        mob_dropdown_active = '''<li><a href="index.html" class="mobile-nav-link active">Home 1</a></li>
        <li><a href="index.html" class="mobile-nav-link">Home 2</a></li>'''
        mob_dropdown_inactive = '''<li><a href="index.html" class="mobile-nav-link">Home 1</a></li>
        <li><a href="index.html" class="mobile-nav-link">Home 2</a></li>'''
        
        if 'Home 1' not in content:
            content = re.sub(mob_pattern1, mob_dropdown_active, content)
            content = re.sub(mob_pattern2, mob_dropdown_inactive, content)

        # 3. Header Actions Re-order and Replace
        # We need to find the <div class="header-actions"> block up to </div> and replace inner content.
        # It's safer to do precise replacements on the buttons.
        
        if 'id="bookPassBtn"' in content:
            # Remove bookPassBtn entirely
            content = re.sub(r'<a href="dashboard\.html" class="btn btn-primary" id="bookPassBtn">Book Jump Pass</a>', '', content)
        
        if 'rtl-toggle' not in content:
            # Inject RTL and Dashboard next to theme toggle
            injection = '''<button class="theme-toggle" id="themeToggleBtn" aria-label="Toggle light/dark theme">
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
        </a>'''
            content = re.sub(r'<button class="theme-toggle".*?</button>', injection, content, flags=re.DOTALL)
            
        # Re-order Login button to be last inside header-actions
        # First, extract login button
        login_btn = r'<a href="login\.html" class="btn btn-secondary" id="loginBtn">Login</a>'
        if re.search(login_btn, content):
            content = re.sub(login_btn + r'\s*', '', content)
            
            # Now find the end of header actions and insert it right before the closing div
            # The structure is:
            # <div class="header-actions">
            #   ... theme, rtl, dashboard
            #   <button class="hamburger" ...>...</button>
            # </div>
            content = re.sub(r'(<button class="hamburger".*?</button>\s*)</div>', r'\1  <a href="login.html" class="btn btn-secondary" id="loginBtn">Login</a>\n      </div>', content, flags=re.DOTALL)

        # 4. Body Ends - Inject AOS JS, Scroll Top
        body_end_injections = '''
  <button id="scrollTopBtn" class="scroll-top-btn" aria-label="Scroll to top" title="Scroll to top">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:24px; height:24px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
  </button>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  <script src="assets/js/main.js"></script>
</body>'''
        
        if '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js">' not in content:
            content = content.replace('<script src="assets/js/main.js"></script>\n</body>', body_end_injections)
            content = content.replace('<script src="assets/js/main.js"></script></body>', body_end_injections)
            content = content.replace('<script src="assets/js/main.js"></script>\r\n</body>', body_end_injections)
            
        # 5. Inject AOS tags to <section>
        content = re.sub(r'(<section\s+class="[^"]+")', r'\1 data-aos="fade-up"', content)

        if content != original_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)

if __name__ == "__main__":
    update_css_js()
    update_html_files()
    print("Successfully updated all HTML, CSS, and JS files.")
