const ru = document.documentElement.lang === 'ru';
const theme = document.querySelector('#theme-toggle');
const setTheme = (value) => {
    document.documentElement.dataset.theme = value;
    theme.setAttribute('aria-pressed', String(value === 'dark'));
    theme.textContent =
        value === 'dark'
            ? ru
                ? 'Светлая тема'
                : 'Light theme'
            : ru
              ? 'Тёмная тема'
              : 'Dark theme';
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

const observer = new IntersectionObserver(
    (entries) => {
        const entry = entries.find((item) => item.isIntersecting);
        if (!entry) return;
        for (const link of links) {
            if (link.hash === '#' + entry.target.id)
                link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        }
    },
    { rootMargin: '-15% 0px -70% 0px' },
);
sections.forEach((section) => observer.observe(section));

for (const button of document.querySelectorAll('.copy-code')) {
    button.addEventListener('click', async () => {
        const text = button
            .closest('.code-block')
            .querySelector('code').textContent;
        try {
            await navigator.clipboard.writeText(text);
            button.textContent = ru ? 'Скопировано' : 'Copied';
            document.querySelector('#copy-status').textContent = ru
                ? 'Код скопирован'
                : 'Code copied';
        } catch {
            // Still let the user select and copy code on non-secure HTTP origins.
            const range = document.createRange();
            range.selectNodeContents(
                button.closest('.code-block').querySelector('code'),
            );
            getSelection().removeAllRanges();
            getSelection().addRange(range);
            button.textContent = ru ? 'Нажмите Ctrl/Cmd+C' : 'Press Ctrl/Cmd+C';
            document.querySelector('#copy-status').textContent =
                button.textContent;
        }
        setTimeout(() => {
            button.textContent = ru ? 'Копировать' : 'Copy';
        }, 2400);
    });
}
