![](res/logo.gif)

# hyperimport

⚡ TypeScript imports on steroids. Import C, Rust, Zig etc. files in your TypeScript code and more.

A powerful plugin for the [Bun](https://bun.sh/) runtime that pushes the limits of Plugin and FFI APIs together, lets you easily import functions from other languages. It works with languages that support the C ABI (Zig, Rust, C/C++, C#, Nim, Kotlin, etc). If the loader of your language isn't there already, go ahead write your own custom loader with it's super flexible API and extend hyperimport to support your favorite language or even customize the built-in loaders to work in the way you want. Not just loaders but any plugin can be imported in hyperimport through it's own package management from [hyperimport registry](https://github.com/tr1ckydev/hyperimport_registry) (our own community registry for bun plugins). [See how](https://github.com/tr1ckydev/hyperimport/wiki/Importing-a-package).

[Read the dev.to article for behind the scenes of this project.](https://dev.to/tr1ckydev/hyperimport-import-c-rust-zig-etc-files-in-typescript-1ia5)

In simple ways, you can do this,

*index.ts*

```ts
import { add } from "./add.rs";
console.log(add(5, 5)); // 10
```

*add.rs*

```rust
#[no_mangle]
pub extern "C" fn add(a: isize, b: isize) -> isize {
    a + b
}
```

and, more...

- Write a TypeScript program using native C functions through libc. [See how](https://github.com/tr1ckydev/hyperimport/wiki/Importing-libc-in-typescript).
- Import native system functions in typescript through system shared libraries.
- Import any kind of bun plugin package from the [hyperimport registry](https://github.com/tr1ckydev/hyperimport_registry).
- Your imagination is now your limit...



## Showcases

- Featured at official Bun 1.0 launch - [Watch video](https://youtu.be/BsnCpESUEqM?t=221)
- Importing a Rust function in typescript (@jarredsumner) - [Watch video](https://twitter.com/jarredsumner/status/1681608754067046400)
- Importing a Zig function in typescript (@jarredsumner) - [Watch video](https://twitter.com/jarredsumner/status/1681610300699869184)
- Walkthrough guide by the community - [Watch video](https://www.youtube.com/watch?v=boD1m5Ex80c)



## Documentation

*—"I wanna learn more about this! How do I get started?"*

Check out the [Wiki](https://github.com/tr1ckydev/hyperimport/wiki) page of this repository to read the entire documentation for this project.

If you have any questions, feel free to join the discord server [here](https://discord.com/invite/tfBA2z8mbq).



## License

This repository uses MIT license. See [LICENSE](https://github.com/tr1ckydev/hyperimport/blob/main/LICENSE) for full license text.
