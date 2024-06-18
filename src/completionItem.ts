import * as vscode from 'vscode';


function getLeadingWhitespace(line: string): string {
    const whitespaceRegex = /^[\s\t]*/;
    const match = line.match(whitespaceRegex);
    return match ? match[0] : '';
}


export abstract class FixCompletionItem{
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

    constructor(languageId: string, config: any) {
        super(languageId, config);
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
            // python class
            if (previousLine.trim().startsWith('class')) {
                const completionItem = new vscode.CompletionItem(`abc-class: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
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


export class CppHandler extends FixCompletionItem{

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


export class JavaHandler extends FixCompletionItem{

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
