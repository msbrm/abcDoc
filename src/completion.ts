import * as vscode from 'vscode';

import { YamlConfigManager } from './tools/yamlConfigManager';
import { CompletionItemProviderDocstring } from './completionItemProviderDocString';
import { CompletionItemProviderHeadstring } from './completionItemProviderHeadString';

class Provider {
    public readonly languageId: string;
    public yamlConfigManager: YamlConfigManager;

    constructor(
        languageId: string,
        extensionPath: string,
        configPath?: string
    ) {
        this.languageId = languageId;
        const pathToLoad = configPath || `${extensionPath}/src/config/template/${languageId}.yaml`;
        this.yamlConfigManager = new YamlConfigManager(pathToLoad);
    }

    getLanguageId(): string {
        return this.languageId;
    }

    getProvider(configPath?: string) {
        let config = this.yamlConfigManager.readConfig(configPath);
        let providerList = [];

        if ('head' in config) {
            let providerHead = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderHeadstring(this.languageId, config),
                'd'
            );
            providerList.push(providerHead);
        }

        if (config.doc) {
            let providerDoc = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderDocstring(this.languageId, config),
                'c'
            );
            providerList.push(providerDoc);
        }

        return providerList;
    }
}

export { Provider };
