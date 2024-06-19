import * as cp from 'child_process';

export function getGitConfigValueSync(configKey: string): string {
    try {
        const stdout = cp.execSync(`git config --get ${configKey}`).toString().trim();
        return stdout;
    } catch (error) {
        console.error(`Failed to get Git config ${configKey}:`, error);
        throw new Error(`Failed to get Git config for ${configKey}`);
    }
}
