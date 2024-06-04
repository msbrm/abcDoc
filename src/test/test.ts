import { YamlConfigManager } from '../yamlConfigManager';

const yamlConfigManager = new YamlConfigManager('../template/python.yaml');
const cfg = yamlConfigManager.readConfig();
console.log(cfg);
const cfg1 = yamlConfigManager.readConfig('../template/test.yaml');
console.log(cfg1);
