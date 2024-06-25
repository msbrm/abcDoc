import * as vscode from 'vscode';
import { Provider } from './completion';

// Read the `abcDoc.languageSettings` configuration item in the `package.json` file
// to see which languages have document template auto-completion enabled
// Return the list of enabled languages.
function getLanguageSettings() {
	let enabledLanguages: { [key: string]: any } = {};

	let pythonSettings = vscode.workspace.getConfiguration('abcDoc.languageSettings.python');
	if (pythonSettings && pythonSettings.enable) {
		enabledLanguages['python'] = {
			'head': pythonSettings.head,
			'docs': pythonSettings.docs,
			'indentation': pythonSettings.indentation
		};
	}

	return enabledLanguages;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension [abcDoc] is now active!');

	// Instantiate a `Provider` object for each programming language
	// based on the result of the `getLanguageSettings` method
	// obtain the auto-completion listener and register it
    for (let [key, value] of Object.entries(getLanguageSettings())) {
		let provider = new Provider(key, value);
		for(const i of provider.getProvider()) {
			context.subscriptions.push(i);
		}
	}
}

export function deactivate() { }
