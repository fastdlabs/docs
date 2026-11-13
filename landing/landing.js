const landing = document.getElementById('landing-page');
const docsApp = document.getElementById('app');
const navLinks = document.getElementById('nav-links');
const navToggle = document.getElementById('nav-toggle');
const skipLink = document.getElementById('skip-link');
const forceDocs = new URLSearchParams(window.location.search).get('docs') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isDocsRoute = () => {
    if (forceDocs) {
        return true;
    }

    const hash = window.location.hash;

    return hash !== '' && hash !== '#' && hash !== '#/';
};

const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<i class="ph ph-list" aria-hidden="true"></i>';
};

const openMenu = () => {
    navLinks.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.innerHTML = '<i class="ph ph-x" aria-hidden="true"></i>';
};

const showLanding = () => {
    if (isDocsRoute()) {
        return;
    }

    landing.hidden = false;
    landing.setAttribute('aria-hidden', 'false');
    docsApp.setAttribute('aria-hidden', 'true');
    document.body.classList.add('landing-open');
};

const hideLanding = () => {
    landing.hidden = true;
    landing.setAttribute('aria-hidden', 'true');
    docsApp.removeAttribute('aria-hidden');
    document.body.classList.remove('landing-open');
    closeMenu();
};

const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (!section) {
        return;
    }

    section.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
    });
    closeMenu();
};

navToggle.addEventListener('click', () => {
    if (navLinks.classList.contains('is-open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => scrollToSection(button.dataset.scroll));
});

document.querySelectorAll('[data-docs-link]').forEach((link) => {
    link.addEventListener('click', () => hideLanding());
});

skipLink.addEventListener('click', () => {
    document.getElementById('main').focus();
    landing.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

window.addEventListener('hashchange', () => {
    if (isDocsRoute()) {
        hideLanding();
    } else {
        showLanding();
    }
});

if (isDocsRoute()) {
    hideLanding();
} else {
    showLanding();
}

const revealObserver = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        }
    },
    {
        root: landing,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.12,
    },
);

document.querySelectorAll('.reveal').forEach((element) => {
    if (reducedMotion) {
        element.classList.add('is-visible');
    } else {
        revealObserver.observe(element);
    }
});

const landingsections = [...document.querySelectorAll('main section[id]')];
let scrollFrame = null;

const updateActiveSection = () => {
    const offset = landing.scrollTop + 128;
    let activeId = landingsections[0]?.id;

    for (const section of landingsections) {
        if (section.offsetTop <= offset) {
            activeId = section.id;
        }
    }

    document.querySelectorAll('[data-scroll]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.scroll === activeId);
    });

    scrollFrame = null;
};

landing.addEventListener(
    'scroll',
    () => {
        if (scrollFrame === null) {
            scrollFrame = requestAnimationFrame(updateActiveSection);
        }
    },
    { passive: true },
);

updateActiveSection();

const segmenter = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh', { granularity: 'word' })
    : null;

const taglineObserver = new IntersectionObserver(
    (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                taglineObserver.unobserve(entry.target);
            }
        }
    },
    {
        root: landing,
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.9,
    },
);

document.querySelectorAll('.tagline-line').forEach((line) => {
    const text = line.textContent;
    const parts = segmenter
        ? [...segmenter.segment(text)].map((part) => part.segment)
        : [...text];

    line.textContent = '';

    for (const part of parts) {
        if (part.trim() === '') {
            line.append(document.createTextNode(part));
            continue;
        }

        const word = document.createElement('span');
        word.className = 'tagline-word';
        word.textContent = part;
        line.append(word);

        if (reducedMotion) {
            word.classList.add('is-revealed');
        } else {
            taglineObserver.observe(word);
        }
    }
});
