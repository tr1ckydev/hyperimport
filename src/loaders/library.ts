import { mkdirSync } from "fs";
import { basename } from "path";
import Loader from "../loader";
import { lastModified, nm } from "../utils";

export default class extends Loader {
    constructor() {
        super("Library Loader",
            {
                extension: "so|dylib",
            }
        );
    }
    async preload() {
        this.config.libPath = this.config.importPath;
    }
    async initConfigTypes() {
        const filename = basename(this.config.importPath);
        mkdirSync(`${this.cwd}/@types/${filename}`, { recursive: true });
        Bun.write(`${this.cwd}/@types/${filename}/lastModified`, lastModified(this.config.importPath));
        const configWriter = Bun.file(`${this.cwd}/@types/${filename}/config.ts`).writer();
        configWriter.write(`import { LoaderConfig, T } from "hyperimport";\nexport default {\n\tsymbols: {`);
        for (const symbol of nm(this.config.libPath)) {
            configWriter.write(`\n\t\t${symbol}: {\n\t\t\targs: [],\n\t\t\treturns: T.void\n\t\t},`);
        }
        configWriter.write(`\n\t}\n} satisfies LoaderConfig.Main;`);
        configWriter.end();
        Bun.write(
            `${this.cwd}/@types/${filename}/types.d.ts`,
            `declare module "*/${filename}" {\n\tconst symbols: import("bun:ffi").ConvertFns<typeof import("./config.ts").default.symbols>;\n\texport = symbols;\n}`
        );
        console.log(`\x1b[32mConfig file has been generated at "${this.cwd}/@types/${filename}/config.ts"\x1b[39m\nEdit the config.ts and set the argument and return types, then rerun the script.`);
    }
    async initConfig() {
        this.initConfigPre();
        this.initConfigTypes();
    }
    async initConfigPre() {
        console.log(`\x1b[33m[HYPERIMPORT]\x1b[39m: ${this.name}\nNo configuration was found for "${this.config.importPath}"\n`);
    }
    async ifSourceModify() { }
}