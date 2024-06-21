export function lineValidation(
    line: string, bracketCount: number, strFlag: string
): { needNextLine: boolean, bracketCount: number, strFlag: string } {
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
                bracketCount += 1;
            }
            if (')]}'.includes(char)) {
                bracketCount -= 1;
            }
            if (char === "'" || char === '"') {
                strFlag = char;
            }
        }
    }
    if (strFlag || bracketCount !== 0) {
        needNextLine = true;
    }
    return { needNextLine, bracketCount, strFlag };
}


export function getLeadingWhitespace(line: string): string {
    const whitespaceRegex = /^[\s\t]*/;
    const match = line.match(whitespaceRegex);
    return match ? match[0] : '';
}


export function reverseString(str: string): string {
    return str.split('').reverse().join('');
}
