import { examples } from './data.js';

const experience = document.getElementById('experience');
const canvas = document.getElementById('experience-canvas');
const fallback = document.getElementById('experience-fallback');
const hud = document.getElementById('warp-hud');
const reveal = document.getElementById('warp-reveal');
const progressBar = document.getElementById('warp-progress');
const progressLabel = document.getElementById('warp-progress-label');
const enterDocs = document.getElementById('enter-docs');
const skipExperience = document.getElementById('skip-experience');
const replayExperience = document.getElementById('replay-experience');
const exampleLabel = document.getElementById('example-label');
const exampleFile = document.getElementById('example-file');
const exampleCode = document.getElementById('example-code');
const exampleLink = document.getElementById('example-link');

const forceDocs = new URLSearchParams(window.location.search).get('docs') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionReady = import('motion').catch(() => null);

let motion = null;
let sceneApi = null;
let sceneLoader = null;
let revealed = false;
let exampleIndex = 0;
let exampleTimer = null;

const isDocsRoute = () => {
    if (forceDocs) {
        return true;
    }

    const hash = window.location.hash;

    return hash !== '' && hash !== '#' && hash !== '#/';
};

const setProgress = (value) => {
    const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
    progressBar.style.width = `${percent}%`;
    progressLabel.textContent = `ENGINE ${String(percent).padStart(3, '0')}%`;
};

const renderExample = () => {
    const index = exampleIndex % examples.length;
    const example = examples[index];
    exampleLabel.textContent = `${example.label} / ${String(index + 1).padStart(2, '0')}`;
    exampleFile.textContent = example.file;
    exampleCode.textContent = example.code;
    exampleLink.href = example.docs;
};

const animateReveal = () => {
    if (reducedMotion) {
        return;
    }

    motionReady.then((module) => {
        motion = module;

        if (!motion) {
            return;
        }

        motion.animate(
            '.warp-reveal > *',
            {
                opacity: [0, 1],
                transform: ['translateY(22px)', 'translateY(0)'],
            },
            {
                delay: motion.stagger(0.08),
                duration: 0.8,
                easing: [0.22, 1, 0.36, 1],
            },
        );
    });
};

const cycleExamples = () => {
    if (reducedMotion || exampleTimer !== null) {
        return;
    }

    exampleTimer = window.setInterval(() => {
        exampleIndex++;
        renderExample();

        if (!motion) {
            return;
        }

        motion.animate(
            '.warp-example',
            { opacity: [0.35, 1], transform: ['translateY(6px)', 'translateY(0)'] },
            { duration: 0.4, easing: 'ease-out' },
        );
    }, 3800);
};

const revealLanding = () => {
    if (revealed) {
        return;
    }

    revealed = true;
    hud.hidden = true;
    reveal.hidden = false;
    experience.classList.add('is-revealed');
    setProgress(1);
    renderExample();
    animateReveal();
    cycleExamples();
};

const showFallback = (message) => {
    fallback.hidden = false;
    canvas.hidden = true;
    replayExperience.hidden = true;
    experience.classList.add('has-fallback');

    const messageNode = fallback.querySelector('[data-fallback-message]');

    if (messageNode && message) {
        messageNode.textContent = message;
    }
};

const ensureScene = () => {
    if (sceneApi !== null) {
        sceneApi.resume();

        return;
    }

    if (sceneLoader !== null) {
        return;
    }

    sceneLoader = import('./scene.js')
        .then(({ startScene }) => {
            sceneApi = startScene({
                canvas,
                fallback,
                onProgress: setProgress,
                onComplete: revealLanding,
            });

            if (canvas.hidden) {
                replayExperience.hidden = true;
                experience.classList.add('has-fallback');
            }

            if (experience.hidden) {
                sceneApi.pause();
            }
        })
        .catch(() => {
            showFallback('3D 场景加载失败，可直接从下方进入文档。');
            revealLanding();
        });
};

const showLanding = () => {
    if (isDocsRoute()) {
        return;
    }

    experience.hidden = false;
    experience.setAttribute('aria-hidden', 'false');
    document.body.classList.add('experience-open');

    if (revealed) {
        hud.hidden = true;
        reveal.hidden = false;
    } else {
        hud.hidden = false;
        reveal.hidden = true;
    }

    if (sceneApi !== null) {
        sceneApi.resume();

        return;
    }

    ensureScene();
};

const hideLanding = () => {
    experience.hidden = true;
    experience.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('experience-open');

    if (sceneApi !== null) {
        sceneApi.pause();
    }
};

const enterDocumentation = () => {
    hideLanding();

    if (window.location.hash !== '#/zh-cn/8.3/readme') {
        window.location.hash = '#/zh-cn/8.3/readme';
    }
};

const restartExperience = () => {
    revealed = false;
    reveal.hidden = true;
    hud.hidden = false;
    experience.classList.remove('is-revealed');
    setProgress(0);
    sceneApi?.restart();
};

enterDocs.addEventListener('click', (event) => {
    event.preventDefault();
    enterDocumentation();
});

skipExperience.addEventListener('click', revealLanding);
replayExperience.addEventListener('click', restartExperience);

window.addEventListener('hashchange', () => {
    if (isDocsRoute()) {
        hideLanding();

        return;
    }

    showLanding();
});

if (isDocsRoute()) {
    hideLanding();
} else {
    showLanding();
}
