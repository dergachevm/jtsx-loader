export default ({
    count,
    label = 'One component. Two environments.',
    buttonLabel = 'Add one',
}) => (
    <div class="client-counter">
        <p>{label}</p>
        <output aria-live="polite">{count}</output>
        <button type="button" data-increment>
            {buttonLabel}
        </button>
    </div>
);
