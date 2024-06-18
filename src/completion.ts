import * as vscode from 'vscode';

import { YamlConfigManager } from './yamlConfigManager';
import { CompletionItemProviderDocstring } from './completionItemProviderDocString';
import { CompletionItemProviderHeadstring } from './completionItemProviderHeadString';

class Provider {
    public readonly languageId: string;
    public yamlConfigManager: YamlConfigManager;

    constructor(
        languageId: string,
        context: vscode.ExtensionContext,
        configPath?: string
    ) {
        this.languageId = languageId;
        const extensionPath = context.extensionPath;
        const pathToLoad = configPath || `${extensionPath}/src/config/template/${languageId}.yaml`;
        this.yamlConfigManager = new YamlConfigManager(pathToLoad);
    }

    getLanguageId(): string {
        return this.languageId;
    }

    getProvider(configPath?: string) {
        let config = this.yamlConfigManager.readConfig(configPath);
        let providerList = [];

        if ('headTriggerCharacters' in config) {
            let providerHead = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderHeadstring(config.head),
                config.headTriggerCharacters
            );
            providerList.push(providerHead);
        }

        if ('docTriggerCharacters' in config) {
            let providerDoc = vscode.languages.registerCompletionItemProvider(
                { scheme: 'file', language: this.languageId },
                new CompletionItemProviderDocstring(this.languageId, config),
                config.docTriggerCharacters
            );
            providerList.push(providerDoc);
        }

        return providerList;
    }
}

export { Provider };
