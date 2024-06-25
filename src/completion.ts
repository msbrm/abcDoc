import * as vscode from 'vscode';

import { CompletionItemProviderDocstring } from './completionItemProviderDocString';
import { CompletionItemProviderHeadstring } from './completionItemProviderHeadString';

class Provider {
    public readonly languageId: string;
    public config: any;

    constructor(
        languageId: string,
        config: any,
    ) {
        this.languageId = languageId;
        this.config = config;
    }

    getLanguageId(): string {
        return this.languageId;
    }

    getProvider() {
        let providerList = [];

        if ('head' in this.config) {
            let providerHead = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderHeadstring(this.languageId, this.config),
                'd'
            );
            providerList.push(providerHead);
        }

        if (this.config.docs) {
            let providerDoc = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderDocstring(this.languageId, this.config),
                's'
            );
            providerList.push(providerDoc);
        }

        return providerList;
    }
}

export { Provider };
