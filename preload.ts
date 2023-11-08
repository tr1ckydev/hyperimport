import { HyperImportConfig } from "./src/types";
import { debugLog } from "./src/utils";

if (Bun.env.DISABLE_PRELOAD !== "1") {

    const cwd = process.cwd();
    const config: HyperImportConfig = (await import(`${cwd}/bunfig.toml`)).default.hyperimport;

    debugLog(config.debug, 3, "registering loaders...");

    for (const loader of config.loaders ?? []) {
        await importPlugin(`./src/loaders/${loader}.ts`)
            .then(name => debugLog(config.debug, 2, name, "has been registered"))
            .catch(() => debugLog(config.debug, 1, "loader not found:", loader));
    }

    for (const loader of config.custom ?? []) {
        await importPlugin(`${cwd}/${loader}`)
            .then(name => debugLog(config.debug, 2, "[CUSTOM]", name, "has been registered"))
            .catch(() => debugLog(config.debug, 1, "[CUSTOM] loader not found:", loader));
    }

    for (const pkg of config.packages ?? []) {
        await importPlugin(`${cwd}/node_modules/.hyperimport/${pkg}/index.ts`)
            .then(() => debugLog(config.debug, 2, "[PACKAGE]", pkg, "has been registered"))
            .catch(async () => {
                debugLog(config.debug, 1, "[PACKAGE] not installed:", pkg);
                debugLog(config.debug, 3, "executing install command...");
                Bun.spawnSync(["bun", "x", "hyperimport", "install"], { env: { PATH: process.env.PATH, DISABLE_PRELOAD: "1" }, stderr: "inherit" });
                await importPlugin(`${cwd}/node_modules/.hyperimport/${pkg}/index.ts`)
                    .then(() => debugLog(config.debug, 2, "[PACKAGE]", pkg, "has been registered"))
                    .catch(() => debugLog(config.debug, 1, "[PACKAGE] unable to import:", pkg));
            });
    }

    async function importPlugin(path: string) {
        const l = await import(path);
        const plugin = await new l.default(config.debug, cwd).toPlugin();
        Bun.plugin(plugin);
        return plugin.name;
    }

}