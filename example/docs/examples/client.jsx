import { renderToString } from 'jtsx-loader/browser.js';
import Counter from './Counter.jsx';

const root = document.querySelector('#client-demo');
const ru = root.dataset.lang === 'ru';
let count = 0;

function render() {
    root.innerHTML = renderToString(
        <Counter
            count={count}
            label={
                ru
                    ? 'Один компонент. Две среды.'
                    : 'One component. Two environments.'
            }
            buttonLabel={ru ? 'Добавить один' : 'Add one'}
        />,
    );
}

// Keep the listener on the stable container when replacing its content.
root.addEventListener('click', (event) => {
    if (event.target.closest('[data-increment]')) {
        count += 1;
        render();
    }
});
render();
