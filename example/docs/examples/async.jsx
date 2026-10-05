const Child = async () => <b>{await Promise.resolve('<Ready>')}</b>;

export default () => <main>
    <Child />
    {[Promise.resolve('A'), ['B', null, false, 0]]}
</main>;
