import { basename, join } from "path";
import Loader from "../../loader";

export default class extends Loader {
    constructor() {
        super("Rust Loader",
            {
                extension: "rs",
                buildCommand: (importPath, outDir) => [
                    "rustc",
                    "--crate-type",
                    "cdylib",
                    importPath,
                    "--out-dir",
                    outDir
                ],
                outDir: importPath => `build/${basename(importPath)}`,
                parseTypes: (importPath, targets) => {
                    // Use Node to run tree-sitter due to Bun issue:
                    // https://github.com/oven-sh/bun/issues/4188
                    const types = Bun.spawnSync([
                        "node",
                        join(import.meta.dir, "parse.js"),
                        importPath,
                        ...targets
                    ]).stdout.toString();
                    try {
                        const result = JSON.parse(types);
                        return result;
                    } catch(e) {
                        return undefined;
                    }
                }
            }
        );
    }
}
