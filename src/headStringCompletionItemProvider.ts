import * as vscode from 'vscode';
import * as cp from 'child_process';

export class HeadstringCompletionItemProvider implements vscode.CompletionItemProvider {
    private languageId: string;
    private insertText: string[];
    private user: string = '';
    private email: string = '';

    constructor(languageId: string, insertText: string[]) {
        this.languageId = languageId;
        this.insertText = insertText;
        this.insertText.forEach(item => {
            console.log(item);

            if (item.includes('${Git.UserName}')) {
                try {
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
            let creationTime: string;
            vscode.workspace.fs.stat(uri).then(stats => {
                creationTime = new Date(stats.ctime).toLocaleString();
                vscode.window.showInformationMessage(`file name: ${fileName}\ncreate time: ${creationTime}`);
            }).then(undefined, err => {
                vscode.window.showErrorMessage(`get file info error: ${err}`);
            });
            const completionItem = new vscode.CompletionItem('abc-head', vscode.CompletionItemKind.Snippet);
            // completionItem.insertText = new vscode.SnippetString(
            //     this.insertText.map(
            //         str => str
            //         .replace('${FileName}', fileName)
            //         .replace('${CreateTime}', creationTime)
            //         .replace('${Git.UserName}', this.user || '${2}')
            //         .replace('${Git.Email}', this.email || '${3}')
            //     ).join('')
            // );
            let insertText = new vscode.SnippetString();
            this.insertText.forEach((item) => {
                insertText.appendText(
                    item.replace('${FileName}', fileName)
                    .replace('${CreateTime}', creationTime)
                    .replace('${Git.UserName}', this.user || '${2}')
                    .replace('${Git.Email}', this.email || '${3}') + `\n`
                );
            });
            // insertText.appendPlaceholder('', 9);
            completionItem.insertText = insertText;

            return [completionItem];
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