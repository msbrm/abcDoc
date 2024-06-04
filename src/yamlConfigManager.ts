import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class YamlConfigManager {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async readConfig(filePath?: string): Promise<Record<string, any>> {
        const pathToRead = filePath || this.filePath;
        return new Promise((resolve, reject) => {
            fs.readFile(pathToRead, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const config = yaml.load(data) as Record<string, any>;
                    resolve(config);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    async writeConfig(config: Record<string, any>, filePath?: string): Promise<void> {
        const pathToWrite = filePath || this.filePath;
        return new Promise((resolve, reject) => {
            try {
                const yamlStr = yaml.dump(config);
                fs.writeFile(pathToWrite, yamlStr, 'utf8', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }
}
