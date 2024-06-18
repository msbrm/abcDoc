import * as vscode from 'vscode';
import * as cp from 'child_process';

export class CompletionItemProviderHeadstring implements vscode.CompletionItemProvider {
    private insertText: string[];
    private user: string = '';
    private email: string = '';

    constructor(insertText: string[]) {
        this.insertText = insertText;
        this.insertText.forEach(item => {
            if (item.includes('${Git.UserName}')) {
                try {
                    // throw new Error("Git.UserName");
                    this.user = getGitConfigValueSync('user.name');
                } catch (error) {
                    console.error('Failed to get Git user information:', error);
                    vscode.window.showErrorMessage(
                        'Failed to get Git user information by `git config --get user.name`.'
                    );
                }
            }

            if (item.includes('${Git.Email}')) {
                try {
                    // throw new Error("Git.Email");
                    this.email = getGitConfigValueSync('user.email');
                } catch (error) {
                    console.error('Failed to get Git user information:', error);
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
        console.log('head');
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
                vscode.window.showInformationMessage(`file name: ${fileName}\ncreate time: ${creationTime}`);

                const completionItem = new vscode.CompletionItem('abc-head', vscode.CompletionItemKind.Snippet);
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

                vscode.window.showInformationMessage(`file name: ${fileName}\ncreate time: ${creationTime}`);
                return [completionItem];
            }).then(undefined, err => {
                vscode.window.showErrorMessage(`get file info error: ${err}`);
                return [];
            });
        }

        return [];
    }
}

function getGitConfigValueSync(configKey: string): string {
    try {
        const stdout = cp.execSync(`git config --get ${configKey}`).toString().trim();
        return stdout;
    } catch (error) {
        console.error('Failed to get Git config:', error);
        throw new Error(`Failed to get Git config for ${configKey}`);
    }
}

export function deactivate() {}
