import * as vscode from 'vscode';
import Parser from 'tree-sitter';
import TreeSitterPython from 'tree-sitter-python';

import {
    lineValidation,
    getLeadingWhitespace,
    reverseString
} from './tools/lineAnalysis';
import {
    pythonGenerateClassDocstring,
    pythonGenerateDefDocstring
} from './genDocstring/pythonDocstring';
import { integer } from 'vscode-languageclient';


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
        const activateLine = document.lineAt(position).text.trim();
        if (activateLine === 'docs') {
            let headLineIdx = position.line - 1;
            const previousLine = document.lineAt(headLineIdx).text;
            const leadingWhitespace = getLeadingWhitespace(previousLine);
            const leadingWhitespaceLength = leadingWhitespace.length;

            const tmpCodeBlock = [];
            let needNextLine: boolean = false;
            let bracketCount: integer = 0;
            let strFlag: string = '';
            tmpCodeBlock.push(previousLine);
            const {
                needNextLine: tmpNeedNextLine,
                bracketCount: tmpBracketCount,
                strFlag: tmpStrFlag
            } = lineValidation(reverseString(previousLine.trim()), bracketCount, strFlag);
            needNextLine = tmpNeedNextLine;
            bracketCount = tmpBracketCount;
            strFlag = tmpStrFlag;
            while (--headLineIdx >= 0) {
                const tmpLine = document.lineAt(headLineIdx).text;
                if (tmpLine.trim().length === 0) {
                    continue;
                }

                if (needNextLine) {
                    tmpCodeBlock.push(tmpLine);
                    const {
                        needNextLine: tmpNeedNextLine,
                        bracketCount: tmpBracketCount,
                        strFlag: tmpStrFlag
                    } = lineValidation(reverseString(tmpLine.trim()), bracketCount, strFlag);
                    needNextLine = tmpNeedNextLine;
                    bracketCount = tmpBracketCount;
                    strFlag = tmpStrFlag;
                } else {
                    break;
                }
            }

            tmpCodeBlock.reverse();
            const blockHead = tmpCodeBlock[0].trim();
            if (blockHead.startsWith('class') || blockHead.startsWith('def')) {
                const completionItem = new vscode.CompletionItem(`abc-docs: ${this.languageId}`, vscode.CompletionItemKind.Snippet);

                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return [];
                }

                let lineIdx = position.line;
                while (++lineIdx < document.lineCount) {
                    const tmpLine = document.lineAt(lineIdx).text;
                    if (tmpLine.trim().length === 0) {
                        continue;
                    }

                    if (getLeadingWhitespace(tmpLine).length > leadingWhitespaceLength || needNextLine) {
                        tmpCodeBlock.push(tmpLine);
                        const {
                            needNextLine: tmpNeedNextLine,
                            bracketCount: tmpBracketCount,
                            strFlag: tmpStrFlag
                        } = lineValidation(tmpLine.trim(), bracketCount, strFlag);
                        needNextLine = tmpNeedNextLine;
                        bracketCount = tmpBracketCount;
                        strFlag = tmpStrFlag;
                    } else {
                        break;
                    }
                }

                const tree = this.parser.parse(tmpCodeBlock.join('\n'));
                const node = tree.rootNode.child(0);
                let docstr;
                if (node) {
                    if (blockHead.startsWith('class')) {
                        docstr = pythonGenerateClassDocstring(leadingWhitespace, this.config.indentation, node);
                    }
                    if (blockHead.startsWith('def')) {
                        docstr = pythonGenerateDefDocstring(leadingWhitespace, this.config.indentation, node);
                    }
                    completionItem.insertText = docstr;
                } else {
                    return [];
                }

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
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
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
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
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
