import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class YamlConfigManager {
    private filePath: string;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    readConfig(filePath?: string): Record<string, any> {
        const pathToRead = filePath || this.filePath;
        try {
            const data = fs.readFileSync(pathToRead, 'utf8');
            const config = yaml.load(data) as Record<string, any>;
            return config;
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Error reading config file: ${err.message}`);
            } else {
                throw new Error('Unknown error reading config file');
            }
        }
    }

    writeConfig(config: Record<string, any>, filePath?: string): void {
        const pathToWrite = filePath || this.filePath;
        try {
            const yamlStr = yaml.dump(config);
            fs.writeFileSync(pathToWrite, yamlStr, 'utf8');
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Error writing config file: ${err.message}`);
            } else {
                throw new Error('Unknown error writing config file');
            }
        }
    }
}
