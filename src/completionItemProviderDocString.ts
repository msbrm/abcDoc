import * as vscode from 'vscode';
import { FixCompletionItem } from './completionItem';
import { PythonHandler } from './completionItem';
import { CppHandler } from './completionItem';
import { JavaHandler } from './completionItem';

export class CompletionItemProviderDocstring implements vscode.CompletionItemProvider {
    private fixCompletionItem: FixCompletionItem | undefined;

    constructor(languageId: string, config: any) {
        switch (languageId) {
            case 'python':
                this.fixCompletionItem = new PythonHandler(languageId, config);
                break;
            case 'cpp':
                this.fixCompletionItem = new CppHandler(languageId, config);
                break;
            case 'java':
                this.fixCompletionItem = new JavaHandler(languageId, config);
                break;
            default:
                this.fixCompletionItem = undefined;
                break;
        }
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        if (this.fixCompletionItem) {
            console.log(`11111111111111111111${context.triggerCharacter}`);
            const docCompletionItem = this.fixCompletionItem.getCompletionItem(document, position, token, context);
            console.log(docCompletionItem);
            return docCompletionItem;
        }
        return [];
    }
}
