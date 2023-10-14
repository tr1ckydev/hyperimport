import { HyperImportConfig } from "./src/types";
import { debugLog } from "./src/utils";

const cwd = process.cwd();
const config: HyperImportConfig = (await import(`${cwd}/bunfig.toml`)).default.hyperimport;

debugLog(config.debug, 3, "registering loaders...");

for (const loader of config.loaders ?? []) {
    await import(`./src/loaders/${loader}.ts`).then(async l => {
        const plugin = await new l.default(cwd).toPlugin();
        Bun.plugin(plugin);
        debugLog(config.debug, 2, plugin.name, "has been registered.");
    }).catch(() => debugLog(config.debug, 1, "loader not found:", loader));
}

for (const loader of config.custom ?? []) {
    await import(`${cwd}/${loader}`).then(async l => {
        const plugin = await new l.default(cwd).toPlugin();
        Bun.plugin(plugin);
        debugLog(config.debug, 2, "[CUSTOM]", plugin.name, "has been registered.");
    }).catch(() => debugLog(config.debug, 1, "[CUSTOM] loader not found:", loader));
}