import { basename } from "path";
import Loader from "../loader";

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
                outDir: importPath => `build/${basename(importPath)}`
            }
        );
    }
}