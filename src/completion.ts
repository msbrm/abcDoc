import * as vscode from 'vscode';

class DocstringCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        if (linePrefix.endsWith("'''")) {
            // 创建注释文档补全项
            const completionItem = new vscode.CompletionItem('"""', vscode.CompletionItemKind.Snippet);
            completionItem.insertText = new vscode.SnippetString(
                `"""\n` +
                `Description.\n` +
                `\n` +
                `Args:\n` +
                `    param1: The first parameter.\n` +
                `    param2: The second parameter.\n` +
                `\n` +
                `Returns:\n` +
                `    The return value.\n` +
                `"""\n`
            );

            // 设置补全项的详细描述
            completionItem.detail = 'Inserts a docstring template';

            // 返回补全项列表
            return [completionItem];
        }

        // 如果不是注释开始部分，则返回空的补全项列表
        return [];
    }
}

// class Provider

let provider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'python' },
    new DocstringCompletionItemProvider(),
    "'"
);



// export { Provider };
