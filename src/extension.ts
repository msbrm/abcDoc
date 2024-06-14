import * as vscode from 'vscode';
import { Provider } from './completion';

// Read the `abcDoc.languageSettings` configuration item in the `package.json` file
// to see which languages have document template auto-completion enabled
// Return the list of enabled languages.
function getLanguageSettings() {
	let enabledLanguages: string[] = [];
	const configuration = vscode.workspace.getConfiguration('abcDoc.languageSettings');
	const languageSettings = configuration as any;

    for (const language in languageSettings) {
        if (typeof languageSettings[language] === 'boolean' && languageSettings[language]) {
            enabledLanguages.push(language);
        }
    }

	return enabledLanguages;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension [abcDoc] is now active!');

	// Instantiate a `Provider` object for each programming language
	// based on the result of the `getLanguageSettings` method
	// obtain the auto-completion listener and register it
    for (const language of getLanguageSettings()) {
		let provider = new Provider(language, context);
		for(const i of provider.getProvider()) {
			context.subscriptions.push(i);
		}
	}
}

export function deactivate() { }
