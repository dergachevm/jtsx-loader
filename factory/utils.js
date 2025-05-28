const errorToObject = (error) => {
    const obj = {};
    for (const key of Object.getOwnPropertyNames(error)) {
        obj[key] = error[key];
    }
    return obj;
}

const errorStackToArray = (error) => {
    const stack = error.stack;
    const lines = stack.split('\n');

    return lines.map(line => {
        const match = line.match(/at (.*) \((.*):(\d+):(\d+)\)/);
        if (match) {
            const functionName = match[1];
            const filePath = match[2];
            const lineNumber = match[3];
            const columnNumber = match[4];

            // console.log(`Function: ${functionName}, File: ${filePath}, Line: ${lineNumber}, Column: ${columnNumber}`);
            return {
                function: functionName,
                file: filePath,
                fileWithLine: `${filePath}:${lineNumber}:${columnNumber}`,
                line: lineNumber,
                column: columnNumber
            }
        }
    }).filter(v => v);
}

export {
    errorStackToArray,
    errorToObject
}