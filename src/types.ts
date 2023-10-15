import { FFIFunction, Narrow } from "bun:ffi";

export { FFIType as T } from "bun:ffi";

export interface HyperImportConfig {
    loaders?: string[],
    custom?: string[],
    debug: boolean,
}

export namespace LoaderConfig {

    export interface Main {
        buildCommand?: string[],
        outDir?: string,
        symbols: Record<string, Narrow<FFIFunction>>,
    }

    export interface Builder {
        extension: string,
        buildCommand?: (importPath: string, outDir: string) => string[],
        outDir?: (importPath: string) => string,
        parseTypes?: (importPath: string, targets: string[]) => Record<string, { args: string[], returns: string }> | undefined,
    }

    export interface Internal {
        importPath: string,
        libPath: string,
        buildCommand: string[],
        outDir: string,
        symbols: Record<string, Narrow<FFIFunction>>,
    }

}