import * as vscode from 'vscode';
import { provider } from './completion';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension [abcDoc] is now active!');

    context.subscriptions.push(provider);
}

export function deactivate() { }
