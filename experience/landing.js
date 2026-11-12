const experience = document.getElementById('experience');
const canvas = document.getElementById('experience-canvas');
const panel = document.getElementById('experience-panel');
const fallback = document.getElementById('experience-fallback');
const enterDocs = document.getElementById('enter-docs');
const skipExperience = document.getElementById('skip-experience');

const forceDocs = new URLSearchParams(window.location.search).get('docs') === '1';
let sceneApi = null;
let sceneLoader = null;

const isDocsRoute = () => {
    if (forceDocs) {
        return true;
    }

    const hash = window.location.hash;

    return hash !== '' && hash !== '#' && hash !== '#/';
};

const showFallback = (message) => {
    fallback.hidden = false;
    canvas.hidden = true;

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
            sceneApi = startScene({ canvas, panel, fallback });

            if (experience.hidden) {
                sceneApi.pause();
            }
        })
        .catch(() => {
            showFallback('3D 场景加载失败，可直接从下方进入文档。');
        });
};

const showLanding = () => {
    if (isDocsRoute()) {
        return;
    }

    experience.hidden = false;
    experience.setAttribute('aria-hidden', 'false');
    document.body.classList.add('experience-open');

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
    panel.hidden = true;

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

enterDocs.addEventListener('click', (event) => {
    event.preventDefault();
    enterDocumentation();
});

skipExperience.addEventListener('click', enterDocumentation);

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
