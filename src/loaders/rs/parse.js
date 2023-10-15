const fs = require("fs");
const Parser = require("tree-sitter");
const Rust = require("tree-sitter-rust");

const path = process.argv[2];
const targets = process.argv.slice(3);

const parser = new Parser();
parser.setLanguage(Rust);

const source = fs.readFileSync(path, "utf8");
const tree = parser.parse(source);

const typeMap = {
  "()": "T.void",
  "bool": "T.bool",
  "u8": "T.u8",
  "u16": "T.u16",
  "u32": "T.u32",
  "u64": "T.u64",
  "i8": "T.i8",
  "i16": "T.i16",
  "i32": "T.i32",
  "i64": "T.i64",
  "f32": "T.f32",
  "f64": "T.f64",
  "usize": "T.ptr",
  "isize": "T.ptr",
  "char": "T.u32"
};

function mapType(type) {
  if(typeMap[type]) {
    return typeMap[type];
  }
  return type;
}

const types = tree.rootNode.children.reduce((acc, node) => {
  if(node.type === "function_item") {
    const fnNameNode = node.children.find(child => child.type === "identifier");
    if(fnNameNode && targets.includes(fnNameNode.text)) {
      const parameters = node.children.find(child => child.type === "parameters");
      const parameterTypes = parameters.children
        .filter((child) => child.type === "parameter")
        .map((child) => {
          const primitiveType = child.children.find((child) => child.type === "primitive_type");
          if(primitiveType) {
            return mapType(primitiveType.text);
          }
          const pointerType = child.children.find((child) => child.type === "pointer_type");
          if(pointerType) {
            return "T.ptr";
          }
          const functionType = child.children.find((child) => child.type === "function_type");
          if(functionType) {
            return "T.function";
          }
        });
      const returnType = node.children.find(child => child.type === "primitive_type" || child.type === "unit_type").text;
      acc[fnNameNode.text] = {
        args: parameterTypes,
        returns: mapType(returnType)
      };
    }
  }
  return acc;
}, {});

process.stdout.write(JSON.stringify(types));
