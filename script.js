// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Fade in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.section, .hero').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Add animation to stat boxes
document.querySelectorAll('.stat-box').forEach((box, index) => {
    box.style.animation = `slideUp 0.6s ease ${index * 0.1}s forwards`;
});

// Analytics (placeholder for future integration)
function trackEvent(eventName, eventData) {
    console.log(`Event: ${eventName}`, eventData);
    // Future: send to analytics service
}

// Track video views
document.querySelectorAll('iframe').forEach(iframe => {
    iframe.addEventListener('load', () => {
        trackEvent('video_loaded', {
            src: iframe.src
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to go to top
    if (e.key === 'Escape') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Detect if user prefers light theme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    console.log('User prefers light theme - consider implementing light theme');
}

console.log('Football Legends App Loaded');
