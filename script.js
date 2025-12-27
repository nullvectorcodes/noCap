// ===============================
// NAVBAR INTERACTIONS
// ===============================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===============================
// STATS COUNTER ANIMATION
// ===============================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Observe stats section for animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===============================
// SCROLL ANIMATIONS (AOS)
// ===============================
const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('[data-aos]').forEach(el => {
    aosObserver.observe(el);
});

// ===============================
// MODAL FUNCTIONALITY
// ===============================
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLogin = document.getElementById('closeLogin');
const closeSignup = document.getElementById('closeSignup');

// Open modals
loginBtn?.addEventListener('click', () => {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

signupBtn?.addEventListener('click', () => {
    signupModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close modals
closeLogin?.addEventListener('click', () => {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
});

closeSignup?.addEventListener('click', () => {
    signupModal.classList.remove('active');
    document.body.style.overflow = '';
});

// Close modals when clicking outside
[loginModal, signupModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        [loginModal, signupModal].forEach(modal => {
            if (modal?.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

// Form submissions
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login submitted');
    alert('Login functionality coming soon!');
});

signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup submitted');
    alert('Signup functionality coming soon!');
});

// ===============================
// CTA BUTTONS
// ===============================
const heroCta = document.getElementById('heroCta');
const watchDemo = document.getElementById('watchDemo');
const ctaSignup = document.getElementById('ctaSignup');
const ctaLearnMore = document.getElementById('ctaLearnMore');

heroCta?.addEventListener('click', () => {
    // Scroll to demo section or open signup modal
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

watchDemo?.addEventListener('click', () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

ctaSignup?.addEventListener('click', () => {
    signupModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
});

ctaLearnMore?.addEventListener('click', () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// ===============================
// DEMO SECTION FUNCTIONALITY
// ===============================
const demoInput = document.getElementById('demoInput');
const demoSubmit = document.getElementById('demoSubmit');
const demoOutput = document.getElementById('demoOutput');

// Auto-resize textarea
if (demoInput) {
    demoInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Demo submission
demoSubmit?.addEventListener('click', async () => {
    const text = demoInput?.value.trim();
    
    if (!text) {
        demoInput?.focus();
        return;
    }

    // Show loading state
    demoSubmit.disabled = true;
    demoSubmit.innerHTML = '<span>Analyzing...</span>';
    
    demoOutput.innerHTML = `
        <div class="demo-output-placeholder">
            <div class="placeholder-icon">⚡</div>
            <div class="placeholder-text">Analyzing your text...</div>
        </div>
    `;

    try {
        // Call the backend API
        const response = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `You are noCap, an intent-aware slang analyzer.

STEP 1 — UNDERSTAND INTENT:
- Determine whether the message is casual, informal, or conversational
- If the tone is casual, evaluate words in their INFORMAL sense

STEP 2 — IDENTIFY ALL SLANG & INFORMAL WORDS:
- Identify EVERY slang word, abbreviation, or informal term
- DO NOT skip any slang words - find ALL of them
- Each slang word should have its own entry

MESSAGE TO ANALYZE: "${text}"

JSON FORMAT:
{"highlighted_message":"", "slangs":[{"word":"","pronunciation":"","meaning":"","example":""}]}

Respond ONLY with valid JSON, no markdown, no explanations.`
                }],
                temperature: 0.1
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const result = JSON.parse(data.reply);

        // Display results
        if (result.slangs && result.slangs.length > 0) {
            let html = '<div class="demo-result">';
            result.slangs.forEach(slang => {
                html += `
                    <div class="demo-result-item">
                        <div class="demo-result-word">${escapeHtml(slang.word || 'N/A')}</div>
                        <div class="demo-result-meaning">${escapeHtml(slang.meaning || 'No meaning provided')}</div>
                        ${slang.example ? `<div style="margin-top: 8px; font-size: 14px; color: var(--text-muted); font-style: italic;">Example: "${escapeHtml(slang.example)}"</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
            demoOutput.innerHTML = html;
        } else {
            demoOutput.innerHTML = `
                <div class="demo-output-placeholder">
                    <div class="placeholder-icon">✅</div>
                    <div class="placeholder-text">No slang words detected in your text!</div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        demoOutput.innerHTML = `
            <div class="demo-output-placeholder">
                <div class="placeholder-icon">⚠️</div>
                <div class="placeholder-text">Unable to analyze. Make sure the backend server is running on localhost:3000</div>
            </div>
        `;
    } finally {
        // Reset button
        demoSubmit.disabled = false;
        demoSubmit.innerHTML = '<span>Analyze</span><span class="btn-icon">→</span>';
    }
});

// Allow Enter key to submit (Shift+Enter for new line)
demoInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        demoSubmit?.click();
    }
});

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===============================
// PARALLAX EFFECT FOR HERO ORBS
// ===============================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');
    
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 0.3;
        orb.style.transform = `translate(${scrolled * speed * 0.05}px, ${scrolled * speed * 0.05}px)`;
    });
});

// ===============================
// INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
// ===============================
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Observe elements with fade-in classes
document.querySelectorAll('.fade-in-up').forEach(el => {
    fadeObserver.observe(el);
});

// ===============================
// FEATURE CARDS HOVER EFFECT
// ===============================
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===============================
// SMOOTH PAGE LOAD
// ===============================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
});

// ===============================
// NAVBAR ACTIVE LINK HIGHLIGHTING
// ===============================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===============================
// PERFORMANCE OPTIMIZATION
// ===============================
// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll-heavy functions
const debouncedScroll = debounce(() => {
    // Scroll-based animations here
}, 10);

window.addEventListener('scroll', debouncedScroll);

