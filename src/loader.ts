import { BunPlugin } from "bun";
import { FFIFunction, Narrow, dlopen, suffix } from "bun:ffi";
import { mkdirSync, readFileSync } from "fs";
import { basename, parse } from "path";
import { LoaderConfig } from "./types";
import { lastModified, nm } from "./utils";

export default class {
    /**The name of the loader. */
    name: string;
    protected cwd: string;
    protected _config: LoaderConfig.Builder;
    // @ts-expect-error
    protected config: LoaderConfig.Internal = {};

    constructor(name: string, config: LoaderConfig.Builder) {
        this.name = name;
        this.cwd = process.cwd();
        this._config = config;
    }

    /**
     * To build the source file into a shared library file.
     */
    async build() {
        Bun.spawnSync(this.config.buildCommand);
    }

    /**
     * Runs at the beginning of `initConfig()`.
     * By default asks for the build command and output directory from the user on importing the source file for the first time.
     */
    async initConfigPre() {
        console.log(`\x1b[33m[HYPERIMPORT]\x1b[39m: ${this.name}\nNo configuration was found for "${this.config.importPath}"\nEnter the build command and output directory to configure it.\nPress enter to use the default values.\n`);
        this.config.buildCommand = prompt("build command: (default)")?.split(" ") ?? this.config.buildCommand;
        this.config.outDir = prompt(`output directory: (${this.config.outDir})`) ?? this.config.outDir;
        mkdirSync(this.config.outDir, { recursive: true });
    }

    /**
     * Generates `config.ts` and `types.d.ts` to add type completions for the source file.
     */
    async initConfigTypes() {
        const filename = basename(this.config.importPath);
        mkdirSync(`${this.cwd}/@types/${filename}`, { recursive: true });
        Bun.write(`${this.cwd}/@types/${filename}/lastModified`, lastModified(this.config.importPath));
        const configWriter = Bun.file(`${this.cwd}/@types/${filename}/config.ts`).writer();
        configWriter.write(`import { LoaderConfig, T } from "hyperimport";\nexport default {\n\tbuildCommand: ${JSON.stringify(this.config.buildCommand)},\n\toutDir: "${this.config.outDir}",\n\tsymbols: {`);
        const symbols = nm(this.config.libPath);
        const types = this._config.parseTypes?.(this.config.importPath, symbols);
        for (const symbol of symbols) {
            const type = types?.[symbol] ?? { args: [], returns: "T.void" };
            const args = type.args.join(", ");
            configWriter.write(`\n\t\t${symbol}: {\n\t\t\targs: [${args}],\n\t\t\treturns: ${type.returns}\n\t\t},`);
        }
        configWriter.write(`\n\t}\n} satisfies LoaderConfig.Main;`);
        configWriter.end();
        Bun.write(
            `${this.cwd}/@types/${filename}/types.d.ts`,
            `declare module "*/${filename}" {\n\tconst symbols: import("bun:ffi").ConvertFns<typeof import("./config.ts").default.symbols>;\n\texport = symbols;\n}`
        );
        console.log(`\n\x1b[32mConfig file has been generated at "${this.cwd}/@types/${filename}/config.ts"\x1b[39m\nEdit the config.ts and set the argument and return types, then rerun the script.`);
    }

    /**
     * When the source file isn't configured yet, this executes to configure it.
     */
    async initConfig() {
        await this.initConfigPre();
        console.log("\nBuilding the source file...");
        await this.build();
        console.log("The source file has been built.");
        await this.initConfigTypes();
    }

    /**
     * Checks if the source file was modified, if it is, then `build()` is executed to rebuild the changed source file.
     */
    async ifSourceModify() {
        const lm = lastModified(this.config.importPath);
        const lmfile = `${this.cwd}/@types/${basename(this.config.importPath)}/lastModified`;
        if (lm !== readFileSync(lmfile).toString()) {
            await this.build();
            await this.initConfigTypes();
            Bun.write(lmfile, lm);
        }
    }

    /**
     * Imports the symbols defined in `config.ts` to be used when opening the shared library.
     * If `config.ts` isn't found, the source file isn't configured yet, hence executes `initConfig()` and exits the process.
     * @returns An object containing the symbols.
     */
    async getSymbols(): Promise<Record<string, Narrow<FFIFunction>>> {
        try {
            await this.ifSourceModify();
            return (await import(`${this.cwd}/@types/${basename(this.config.importPath)}/config.ts`)).default.symbols;
        } catch {
            await this.initConfig();
            process.exit();
        }
    }

    /**
     * Runs just before opening/loading the shared library.
     */
    async preload() {
        this.config.outDir = this._config.outDir!(this.config.importPath);
        this.config.buildCommand = this._config.buildCommand!(this.config.importPath, this.config.outDir);
        this.config.libPath = `${this.config.outDir}/lib${parse(this.config.importPath).name}.${suffix}`;
    }

    /**
     * Creates the plugin instance to be consumed by `Bun.plugin()` to register it.
     * @returns A `BunPlugin` instance.
     */
    async toPlugin(): Promise<BunPlugin> {
        const parentThis = this;
        return {
            name: parentThis.name,
            setup(build) {
                build.onLoad({ filter: new RegExp(`\.(${parentThis._config.extension})$`) }, async args => {
                    parentThis.config.importPath = args.path;
                    await parentThis.preload();
                    return {
                        exports: dlopen(parentThis.config.libPath, await parentThis.getSymbols()).symbols,
                        loader: "object"
                    };
                });
            }
        };
    }

}