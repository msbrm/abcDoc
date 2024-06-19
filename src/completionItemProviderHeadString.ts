import * as vscode from 'vscode';

import { getGitConfigValueSync } from './tools/getGitConfigValueSync';

export class CompletionItemProviderHeadstring implements vscode.CompletionItemProvider {
    private languageId: string;
    private insertText: string[];
    private headTriggerCharacters: string;
    private user: string = '';
    private email: string = '';

    constructor(languageId: string, config: any) {
        this.languageId = languageId;
        this.insertText = config.head;
        this.headTriggerCharacters = config.headTriggerCharacters;
        this.insertText.forEach(item => {
            if (item.includes('${Git.UserName}')) {
                try {
                    this.user = getGitConfigValueSync('user.name');
                } catch (error) {
                    vscode.window.showErrorMessage(
                        'Failed to get Git user information by `git config --get user.name`.'
                    );
                }
            }

            if (item.includes('${Git.Email}')) {
                try {
                    this.email = getGitConfigValueSync('user.email');
                } catch (error) {
                    vscode.window.showErrorMessage(
                        'Failed to get Git user information by `git config --get user.email`.'
                    );
                }
            }
        });
    }

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        if (position.line === 0 && position.character === 4 && document.lineAt(position).text === 'head') {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found.');
                return [];
            }

            const uri = editor.document.uri;
            const fileName = vscode.workspace.asRelativePath(uri);

            return vscode.workspace.fs.stat(uri).then(stats => {
                // en-US: `MM/DD/YYYY, HH:MM:SS AM/PM`
                // zh-CN: `YYYY/MM/DD HH:MM:SS`
                // en-GB: `DD/MM/YYYY, HH:MM:SS`
                const creationTime = new Date(stats.ctime).toLocaleString('zh-CN');
                const completionItem = new vscode.CompletionItem(`abc-head: ${this.languageId}`, vscode.CompletionItemKind.Snippet);
                let insertText = new vscode.SnippetString();

                for (const item of this.insertText) {
                    // FileName
                    if (item.includes('${FileName}')) {
                        insertText.appendText(item.replace('${FileName}', fileName) + `\n`);
                        continue;
                    }
                    // Description
                    if (item.includes('${Description}')) {
                        insertText.appendText(item.replace('${Description}', ''));
                        insertText.appendPlaceholder('Description');
                        insertText.appendText(`\n`);
                        continue;
                    }
                    // CreateTime
                    if (item.includes('${CreateTime}')) {
                        insertText.appendText(item.replace('${CreateTime}', creationTime) + `\n`);
                        continue;
                    }
                    // Author
                    if (item.includes('${Git.UserName}') || item.includes('${Git.Email}')) {
                        insertText.appendText(
                            item.replace('${Git.UserName}', this.user || '')
                            .replace('${Git.Email}', this.email || '')
                        );
                        if (!(this.user && this.email)) {
                            insertText.appendPlaceholder('author');
                        }
                        insertText.appendText(`\n`);
                        continue;
                    }
                    insertText.appendText(item + `\n`);
                }
                completionItem.insertText = insertText;

                return [completionItem];
            }).then(undefined, err => {
                vscode.window.showErrorMessage(`get file info error: ${err}`);
                return [];
            });
        }

        return [];
    }
}

