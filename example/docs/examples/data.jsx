import { raw } from 'jtsx-loader/runtime.js';

// Escape HTML end tags before opting into raw JSON output.
export default ({ value }) => <script type="application/json">
    {raw(JSON.stringify(value).replaceAll('<', '\\u003c'))}
</script>;
