// TODO: типы для тайпскрипта
// @ts-nocheck

interface Props {
    children: any
    inner?: string
}

export default ({ children, renderCount, lang }: Props) => {
    return !lang ? <>
            <p>Импортированный на страницу Фрагмент <code>components/Inner.tsx</code></p>
            <p class="render-count">Сколько раз был отрендерен компонент после рестарта сервера: <span>{renderCount}</span></p>
            <p className="myClassName">В этом блоке используется <code>className</code>, который преобразуется в <code>class</code></p>
            <p><b>Дочерние компоненты перереданные из родительского:</b></p>
            <div>
                {children}
            </div>
        </> : <>
            <p>Fragment imported to page <code>components/Inner.tsx</code></p>
            <p class="render-count">The number of times the component was rendered after the server restart: <span>{renderCount}</span></p>
            <p className="myClassName">This block uses <code>className</code>, which is converted to <code>class</code></p>
            <p><b>Children components re-rendered from the parent:</b></p>
            <div>
                {children}
            </div>
        </>
}
