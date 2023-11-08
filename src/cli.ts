#!/usr/bin/env bun

import { HyperImportConfig, debugLog } from ".";
import { fetchDirectory } from "./fetchgit";

const cwd = process.cwd();
const PKG_INSTALL_DIR = `${cwd}/node_modules/.hyperimport`;

function installPackage(name: string, debug: boolean) {
    debugLog(debug, 3, "installing package:", name);
    fetchDirectory(name, {
        path: `packages/${name}`,
        destination: `${PKG_INSTALL_DIR}/${name}`
    }).then(() => Bun.spawnSync(["bun", "i", "--production"], { cwd: `${PKG_INSTALL_DIR}/${name}`, stderr: "ignore" }));
}

switch (process.argv[2]) {
    case "i":
    case "install":
        const config: HyperImportConfig = (await import(`${cwd}/bunfig.toml`)).default.hyperimport;
        if (config.packages) {
            config.packages.forEach(pkg => installPackage(pkg, config.debug));
        } else {
            throw "no packages found in the config";
        }
        break;
    default:
        throw "no arguments provided";
}