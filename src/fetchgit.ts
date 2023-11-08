// Adapted from https://github.com/tr1ckydev/fetchgit

import { mkdirSync } from "fs";

interface DirectoryConfig {
    path: string,
    destination: string,
}

interface GitHubContents {
    name: string,
    path: string,
    sha: string,
    size: number,
    url: string,
    html_url: string,
    git_url: string,
    download_url: string,
    type: "file" | "dir",
    _links: {
        self: string,
        git: string,
        html: string,
    },
}

interface ContentNotFound {
    message: "Not Found",
    documentation_url: string;
}

export async function fetchDirectory(pkg: string, config: DirectoryConfig) {
    const contents = await (await fetch(`https://api.github.com/repos/tr1ckydev/hyperimport_registry/contents/${config.path}`)).json();
    if ((contents as ContentNotFound).message === "Not Found") {
        throw `not found in registry: ${pkg}`;
    }
    mkdirSync(`${config.destination}/${config.path.replace(`packages/${pkg}`, "")}`, { recursive: true });
    for (const content of (contents as GitHubContents[])) {
        const fetch_path = content.path.replace(`packages/${pkg}/`, "");
        switch (content.type) {
            case "file":
                Bun.write(`${config.destination}/${fetch_path}`, await fetch(content.download_url));
                break;
            case "dir":
                fetchDirectory(pkg, {
                    path: content.path,
                    destination: config.destination
                });
                break;
        }
    }
};