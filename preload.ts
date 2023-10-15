import { HyperImportConfig } from "./src/types";
import { debugLog } from "./src/utils";

const cwd = process.cwd(),
    config: HyperImportConfig = (await import(`${cwd}/bunfig.toml`)).default.hyperimport;

debugLog(config.debug, 3, "registering loaders...");

for (const loader of config.loaders ?? []) 
    try {
        const l = await import(`./src/loaders/${loader}.ts`),
            plugin = await new l.default(cwd).toPlugin();
    
        Bun.plugin(plugin);
        debugLog(config.debug, 2, plugin.name, "has been registered.");
    } catch (e) {
        debugLog(config.debug, 1, "loader not found:", loader);
    }


for (const loader of config.custom ?? []) 
    try {
        const l = await import(`${cwd}/${loader}`),
            plugin = await new l.default(cwd).toPlugin();
        
        Bun.plugin(plugin);
        debugLog(config.debug, 2, "[CUSTOM]", plugin.name, "has been registered.");
    } catch (e) {
        debugLog(config.debug, 1, "[CUSTOM] loader not found:", loader);
    }
