const ru = document.documentElement.lang === 'ru';
const theme = document.querySelector('#theme-toggle');
const setTheme = (value) => {
    document.documentElement.dataset.theme = value;
    theme.setAttribute('aria-pressed', String(value === 'dark'));
    const label =
        value === 'dark'
            ? ru
                ? 'Светлая тема'
                : 'Light theme'
            : ru
              ? 'Тёмная тема'
              : 'Dark theme';
    theme.querySelector('[data-theme-label]').textContent = label;
    theme.setAttribute('aria-label', label);
    theme.title = label;
    theme.querySelector('.icon').src = '/styles/icons/' + (value === 'dark' ? 'sun' : 'moon') + '.svg';
};
let saved;
try {
    saved = localStorage.getItem('jtsx-docs-theme');
} catch {}
setTheme(
    saved === 'dark' || saved === 'light'
        ? saved
        : matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
);
theme.hidden = false;
theme.addEventListener('click', () => {
    const value =
        document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(value);
    try {
        localStorage.setItem('jtsx-docs-theme', value);
    } catch {}
});

for (const options of document.querySelectorAll('[data-tabs]')) {
    const tablist = options.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = [...options.querySelectorAll('[role="tabpanel"]')];
    const select = (index, focus = false) => {
        tabs.forEach((tab, i) => {
            tab.setAttribute('aria-selected', String(i === index));
            tab.tabIndex = i === index ? 0 : -1;
            panels[i].hidden = i !== index;
        });
        if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(index));
        tab.addEventListener('keydown', (event) => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            select(next, true);
        });
    });
    select(0);
    options.dataset.enhanced = 'true';
    tablist.hidden = false;
}

const search = document.querySelector('#docs-search');
const links = [...document.querySelectorAll('#section-nav a')];
const sections = [...document.querySelectorAll('.doc-section')];
const menu = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('.sidebar');
sidebar.dataset.enhanced = 'true';
menu.hidden = false;
const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    sidebar.dataset.open = String(open);
};
menu.addEventListener('click', () =>
    setMenu(menu.getAttribute('aria-expanded') !== 'true'),
);
links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
search.hidden = false;
search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    if (query) setMenu(true);
    let matches = 0;
    sections.forEach((section, index) => {
        const visible = section.textContent.toLocaleLowerCase().includes(query);
        links[index].hidden = !visible;
        if (visible) matches++;
    });
    document.querySelector('#search-empty').hidden = matches > 0;
});

// The article may be taller than a viewport: use its start positions so the
// active section stays stable through long code examples and reverse scrolling.
const toc = document.querySelector('#page-toc');
let activeSection;
let headings = [];
const updateLocation = () => {
    const current = sections.findLast((section) => section.getBoundingClientRect().top <= 110) || sections[0];
    if (current !== activeSection) {
        activeSection = current;
        links.forEach((link) => {
            if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        headings = [...current.querySelectorAll('h2[id], h3[id], [data-toc-label]')].filter((heading) => heading.id !== current.id + '-title');
        if (!headings.length) headings = [current.querySelector('[id$="-title"]')];
        toc.replaceChildren(...headings.map((heading) => {
            const link = document.createElement('a');
            link.href = '#' + heading.id;
            link.textContent = heading.dataset.tocLabel || heading.textContent.replace(/^\d{2}(?=\D)/, '').trim();
            return link;
        }));
    }
    const currentHeading = headings.findLast((heading) => heading.getBoundingClientRect().top <= 120) || headings[0];
    for (const link of toc.querySelectorAll('a')) {
        if (link.hash === '#' + currentHeading.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    }
};
let locationQueued = false;
const queueLocation = () => {
    if (locationQueued) return;
    locationQueued = true;
    requestAnimationFrame(() => {
        locationQueued = false;
        updateLocation();
    });
};
window.addEventListener('scroll', queueLocation, { passive: true });
window.addEventListener('resize', queueLocation);
window.addEventListener('hashchange', queueLocation);
window.addEventListener('load', queueLocation);
updateLocation();

// A plain slash is a shortcut only outside editable controls.
document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey ||
        event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    search.focus();
});

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Support local/plain HTTP previews where the Clipboard API is absent.
        const field = document.createElement('textarea');
        field.value = text;
        field.className = 'sr-only';
        field.setAttribute('readonly', '');
        const focused = document.activeElement;
        document.body.append(field);
        field.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        field.remove();
        focused?.focus({ preventScroll: true });
        return copied;
    }
}

for (const button of document.querySelectorAll('.copy-code, [data-copy-command]')) {
    const command = button.dataset.copyCommand;
    const container = command ? button.closest('.sidebar-note') : button.closest('.code-block');
    const label = container.querySelector('[data-copy-label]');
    const original = label.textContent;
    let resetTimer;
    button.addEventListener('click', async () => {
        clearTimeout(resetTimer);
        const code = container.querySelector('code');
        const success = await copyText(command || code.textContent);
        container.dataset.copied = String(success);
        if (success) {
            label.textContent = ru ? 'Скопировано' : 'Copied';
        } else {
            const range = document.createRange();
            range.selectNodeContents(code);
            getSelection().removeAllRanges();
            getSelection().addRange(range);
            label.textContent = ru ? 'Нажмите Ctrl/Cmd+C' : 'Press Ctrl/Cmd+C';
        }
        document.querySelector('#copy-status').textContent = success
            ? (ru ? 'Код скопирован в буфер обмена' : 'Code copied to clipboard')
            : label.textContent;
        resetTimer = setTimeout(() => {
            label.textContent = original;
            delete container.dataset.copied;
        }, 2400);
    });
}
