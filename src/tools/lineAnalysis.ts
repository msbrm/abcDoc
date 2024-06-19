export function lineValidation(
    line: string, bracketStack: string[], strFlag: string
): { needNextLine: boolean, bracketStack: string[], strFlag: string } {
    let needNextLine: boolean = false;
    for (let char of line) {
        if (strFlag) {
            if (char === strFlag) {
                strFlag = '';
            } else {
                continue;
            }
        } else {
            if ('([{'.includes(char)) {
                bracketStack.push(char);
            }
            if (')]}'.includes(char)) {
                bracketStack.pop();
            }
            if (char === "'" || char === '"') {
                strFlag = char;
            }
        }
    }
    if (strFlag || bracketStack.length > 0) {
        needNextLine = true;
    }
    return { needNextLine, bracketStack, strFlag };
}

export function getLeadingWhitespace(line: string): string {
    const whitespaceRegex = /^[\s\t]*/;
    const match = line.match(whitespaceRegex);
    return match ? match[0] : '';
}
