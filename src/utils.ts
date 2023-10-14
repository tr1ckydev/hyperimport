/**
 * Prints a debug message to the console.
 * @param isDebug The boolean debug flag.
 * @param mode The color of the message.
 * @param args The message to print.
 */
export function debugLog(isDebug: boolean, mode: 1 | 2 | 3, ...args: string[]) {
    console.assert(!isDebug, `\x1b[3${mode}m\x1b[1m[HYPERIMPORT]\x1b[22m\x1b[39m`, ...args);
}

/**
 * Returns the last modified time of the file.
 * @param path The path to the file.
 */
export function lastModified(path: string) {
    return `${Bun.file(path).lastModified}`;
}

/**
 * Returns the list of exported symbols in the library using the `nm` command.
 * @param path The path to the library to be loaded.
 */
export function nm(path: string) {
    return [...Bun.spawnSync(["nm", path]).stdout.toString().matchAll(/T (.*)$/gm)].map(x => x[1]);
}