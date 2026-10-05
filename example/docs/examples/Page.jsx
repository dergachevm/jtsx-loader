import { raw } from 'jtsx-loader';

const Badge = ({ children }) => <strong>{children}</strong>;

export default ({ title }) => <main>
    <h1>{title}</h1>
    <Badge>Rendered on the server</Badge>
    <p>{raw('<em>Trusted HTML</em>')}</p>
</main>;
