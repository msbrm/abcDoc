import * as vscode from 'vscode';

export class DocstringCompletionItemProvider implements vscode.CompletionItemProvider {
    private languageId: string;
    private config;

    constructor(languageId: string, config: any) {
        this.languageId = languageId;
        this.config = config;
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        console.log(position.character);
        if (linePrefix.endsWith("'''")) {
            const completionItem = new vscode.CompletionItem('abc-head', vscode.CompletionItemKind.Snippet);
            completionItem.insertText = new vscode.SnippetString(
                `"""\n` +
                `Description.\n` +
                `"""\n`
            );

            // 设置补全项的详细描述
            // completionItem.detail = 'Inserts a docstring template';

            // 返回补全项列表
            return [completionItem];
        }

        // 如果不是注释开始部分，则返回空的补全项列表
        return [];
    }
}
