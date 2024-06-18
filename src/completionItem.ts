import * as vscode from 'vscode';
import Parser from 'tree-sitter';
import TreeSitterPython from 'tree-sitter-python';


function lineValidation(
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


function getLeadingWhitespace(line: string): string {
    const whitespaceRegex = /^[\s\t]*/;
    const match = line.match(whitespaceRegex);
    return match ? match[0] : '';
}


export abstract class FixCompletionItem {
    public languageId: string;
    public config;

    constructor(languageId: string, config: any) {
        this.languageId = languageId;
        this.config = config;
        console.log(`init abc-doc language: ${this.languageId}`);
    }

    abstract getCompletionItem(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>>;
}


export class PythonHandler extends FixCompletionItem {
    private parser;

    constructor(languageId: string, config: any) {
        super(languageId, config);
        this.parser = new Parser();
        this.parser.setLanguage(TreeSitterPython);

    }

    getCompletionItem(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const activateLine = document.lineAt(position).text;
        const linePrefixTrim = activateLine.substring(0, position.character).trim();
        console.debug(position.character);
        if (linePrefixTrim.endsWith(this.config.docTriggerCharacters.repeat(3))) {
            const previousLine = document.lineAt(position.line - 1).text;
            const leadingWhitespace = getLeadingWhitespace(previousLine);
            const leadingWhitespaceLength = leadingWhitespace.length;
            const tmpCodeBlock = [];
            // python class
            if (previousLine.trim().startsWith('class')) {
                const completionItem = new vscode.CompletionItem(`abc-class: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
                const insertConfig = this.config.class;
                let insertText = new vscode.SnippetString();

                let lineIdx = position.line;
                let needNextLine: boolean = false;
                let bracketStack: string[] = [];
                let strFlag: string = '';
                tmpCodeBlock.push(previousLine);
                const {
                    needNextLine: tmpNeedNextLine,
                    bracketStack: tmpBracketStack,
                    strFlag: tmpStrFlag
                } = lineValidation(previousLine.trim(), bracketStack, strFlag);
                needNextLine = tmpNeedNextLine;
                bracketStack = tmpBracketStack;
                strFlag = tmpStrFlag;
                while (++lineIdx < document.lineCount) {
                    const tmpLine = document.lineAt(lineIdx).text;
                    if (tmpLine.trim().length === 0) {
                        continue;
                    }

                    if (getLeadingWhitespace(tmpLine).length > leadingWhitespaceLength || needNextLine) {
                        tmpCodeBlock.push(tmpLine);
                        const {
                            needNextLine: tmpNeedNextLine,
                            bracketStack: tmpBracketStack,
                            strFlag: tmpStrFlag
                        } = lineValidation(tmpLine.trim(), bracketStack, strFlag);
                        needNextLine = tmpNeedNextLine;
                        bracketStack = tmpBracketStack;
                        strFlag = tmpStrFlag;
                    } else {
                        break;
                    }
                }

                let classProperties: { name: string, type: string }[] = [];
                const tree = this.parser.parse(tmpCodeBlock.join('\n'));
                const node = tree.rootNode.child(0);
                console.log(node);
                node?.children.forEach((classBodyChildNode) => {
                    if (classBodyChildNode.type === 'class_element') {
                        if (classBodyChildNode.firstChild?.type === 'property_declaration') {
                            const propertyDeclarationNode = classBodyChildNode.firstChild;
                            if (propertyDeclarationNode?.type === 'property_declaration') {
                                const identifierNode = propertyDeclarationNode.childNamed('identifier');
                                const propertyName = identifierNode ? identifierNode.text : '';
                                const propertyTypeNode = propertyDeclarationNode.nextSibling;
                                const propertyType = propertyTypeNode ? propertyTypeNode.text.trim() : '';
                                classProperties.push({ name: propertyName, type: propertyType });
                            }
                        }
                    }
                });

                for (const item of insertConfig) {
                    // insertText.appendText(leadingWhitespace);
                    insertText.appendText(item);
                    insertText.appendText(`\n`);
                }
                completionItem.insertText = insertText;
                return [completionItem];
            }

            // python def
            if (previousLine.trim().startsWith('def')) {
                const completionItem = new vscode.CompletionItem(`abc-def: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
                const insertConfig = this.config.class;
                let insertText = new vscode.SnippetString();
                for (const item of insertConfig) {
                    // insertText.appendText(leadingWhitespace);
                    insertText.appendText(item);
                    insertText.appendText(`\n`);
                }
                completionItem.insertText = insertText;
                return [completionItem];
            }
        }

        return [];
    }
}


export class CppHandler extends FixCompletionItem {

    constructor(languageId: string, config: any) {
        super(languageId, config);
    }

    getCompletionItem(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        console.log(this.config);
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        console.log(position.character);
        if (linePrefix.endsWith("'''")) {
            const completionItem = new vscode.CompletionItem(`abc-doc: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
            completionItem.insertText = new vscode.SnippetString(
                `"""\n` +
                `Description.\n` +
                `"""\n`
            );

            // completionItem.detail = 'Inserts a docstring template';
            return [completionItem];
        }

        return [];
    }
}


export class JavaHandler extends FixCompletionItem {

    constructor(languageId: string, config: any) {
        super(languageId, config);
    }

    getCompletionItem(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        console.log(this.config);
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        console.log(position.character);
        if (linePrefix.endsWith("'''")) {
            const completionItem = new vscode.CompletionItem(`abc-doc: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
            completionItem.insertText = new vscode.SnippetString(
                `"""\n` +
                `Description.\n` +
                `"""\n`
            );

            // completionItem.detail = 'Inserts a docstring template';
            return [completionItem];
        }

        return [];
    }
}
