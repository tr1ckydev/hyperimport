import { suffix } from "bun:ffi";
import { basename, parse } from "path";
import Loader from "../loader";

export default class extends Loader {
    constructor() {
        super("Zig Loader",
            {
                extension: "zig",
                buildCommand: (importPath, outDir) => [
                    "zig",
                    "build-lib",
                    importPath,
                    "-dynamic",
                    "-OReleaseFast",
                    `-femit-bin=${outDir}/lib${parse(importPath).name}.${suffix}`
                ],
                outDir: importPath => `build/${basename(importPath)}`
            }
        );
    }
}