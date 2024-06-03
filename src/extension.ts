// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "abcDocTest" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('abcDoc.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from abcDoc!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {
// 	console.log('deactivate');
// }

import * as vscode from 'vscode';

class DocstringCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        // 获取用户输入的文本直到光标位置
        const linePrefix = document.lineAt(position).text.substr(0, position.character);

        // 如果用户输入了三个单引号，则提供注释文档补全
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

export function activate(context: vscode.ExtensionContext) {
    // 注册注释文档补全提供者
    let provider = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'python' }, new DocstringCompletionItemProvider(), '\'');

    context.subscriptions.push(provider);
}

export function deactivate() {}
