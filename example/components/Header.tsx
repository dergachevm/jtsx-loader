// @ts-nocheck
import fs from 'node:fs';

// TODO: типы для тайпскрипта
interface Props {
    children: any
    lang: string
}

export default ({ children, renderCount, lang }: Props) => {
    const { version } = JSON.parse(fs.readFileSync('package.json').toString());

    return <div class="lang">
        <h1>JTSX Loader <small>v{version}</small></h1>
        <a href="/ru" class={lang === 'ru' && 'is-active'}>Russian</a> / <a href="/" class={lang === 'en' && 'is-active'}>English</a>
    </div>
}
