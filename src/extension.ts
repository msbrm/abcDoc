// import * as vscode from 'vscode';
// // import { Provider } from './completion';


// export function activate(context: vscode.ExtensionContext) {
// 	console.log('Extension "your-extension-name" is now active!');
//     // let provider = Provider();

//     // context.subscriptions.push(provider);
// }

// export function deactivate() { }

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "your-extension-name" is now active!');

    const config = vscode.workspace.getConfiguration('languageSettings');

    // 监听活动编辑器变化的事件
    vscode.window.onDidChangeActiveTextEditor(() => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const languageId = document.languageId;

            const isEnabled = config.get<boolean>(languageId);

            if (isEnabled) {
                console.log(`The language of the current file is: ${languageId}`);
            }
        } else {
            console.log('No active editor.');
        }
    });

    // 注册命令
    let disposable = vscode.commands.registerCommand('extension.getFileLanguage', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const languageId = document.languageId;

            const isEnabled = config.get<boolean>(languageId);

            if (isEnabled) {
                vscode.window.showInformationMessage(`The language of the current file is: ${languageId}`);
            } else {
                vscode.window.showInformationMessage(`The language ${languageId} is disabled in settings.`);
            }
        } else {
            vscode.window.showInformationMessage('No active editor.');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}