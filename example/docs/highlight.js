import { createHighlighter } from 'shiki';

const langs = [
    'jsx',
    'tsx',
    'javascript',
    'typescript',
    'json',
    'html',
    'css',
    'bash',
    'powershell',
];
const highlighter = await createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs,
});

export function highlight(code, language) {
    return highlighter.codeToHtml(code, {
        lang: langs.includes(language) ? language : 'text',
        themes: { light: 'github-light', dark: 'github-dark' },
    });
}
