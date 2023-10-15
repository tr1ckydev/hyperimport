import { HyperImportConfig } from "./src/types";
import { debugLog } from "./src/utils";

const cwd = process.cwd();
const config: HyperImportConfig = (await import(`${cwd}/bunfig.toml`)).default.hyperimport;

debugLog(config.debug, 3, "registering loaders...");

/**
 * Register a plugin
 * @param loader
 * @param path A path to register
 * @param custom Whether it is a custom plugin
 */
async function register(loader, path: string, custom: boolean) {
    const isCustom = custom ? "[CUSTOM] " : "";
    
    try {
        const l = await import(path);
        const plugin = await new l.default(cwd).toPlugin();

        Bun.plugin(plugin);
        debugLog(config.debug, 2, isCustom + plugin.name, "has been registered.");
    } catch (e) {
        debugLog(config.debug, 1, isCustom + "loader not found:", loader);
    }

// Register default loader
for (const loader of config.loaders ?? []) 
    register(loader, `./src/loaders/${loader}.ts`, false);

// Register custom loader
for (const loader of config.custom ?? []) 
    register(loader, `${cwd}/${loader}`, true);
