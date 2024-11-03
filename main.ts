import { VarType } from "./frontend/ast.ts";
import { tokenize } from "./frontend/lexer.ts";
import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environments.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_NULL, MK_NUMBER, MK_BOOL } from "./runtime/values.ts";
import { existsSync } from "node:fs";

export const version: string = "0.0.1-alpha";

let args: string[] = [];

if (Deno.args.length > 0) {
  args = Deno.args;
}

if (args.length > 0) {
  switch (args[0]) {
    case "-f":
    case "--file":
      if (args.length == 2) run(args[1]);
      else console.error('There must be a file path after "-f" or "--file"');
      break;
    case "-v":
    case "--version":
      console.log("NickLang Version: " + version);
      break;
    case "-r":
    case "--repl":
      repl();
      break;
    default:
      console.error('"' + args[0] + '" is not valid argument');
      break;
  }
} else {
  console.log("Usage:");
  console.log("\t-f or --file <file-path> - Run Script From File");
  console.log("\t-r or --repl - Start Repl (Terminal)");
  console.log("\t-v or --version - Print NickLang Version");
  console.log("\t-h or --help - Print Help For NickLang");
}
//const filename = prompt("Script Path:");

//if(filename)
//  run(filename);
//();

async function run(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  if (existsSync(filename)) {
    const input = await Deno.readTextFile(filename);

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    //console.log(result);
  } else console.error('File "' + filename + '" does not exists!');
}

function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();

  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    //console.log(result);
  }
}
