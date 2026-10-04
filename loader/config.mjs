import path from 'node:path';
import { stat } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function readConfig() {
    const filePath = path.join(process.cwd(), 'jtsx.config.js');
    try {
        // Only absence of this file is optional. ERR_MODULE_NOT_FOUND from an
        // import inside the configuration must still be reported.
        try {
            await stat(filePath);
        } catch (error) {
            if (error.code === 'ENOENT') return undefined;
            throw error;
        }
        return (await import(pathToFileURL(filePath).href)).default;
    } catch (cause) {
        const error = new Error(`[jtsx-loader] Cannot load ${filePath}: ${cause?.message ?? cause}`, { cause });
        error.code = 'ERR_JTSX_CONFIG';
        // This switch must be outside the configuration: a broken JS file
        // cannot supply its own strict-mode setting.
        if (process.env.JTSX_STRICT_CONFIG === '1') throw error;
        console.warn(error.message);
        return undefined;
    }
}
