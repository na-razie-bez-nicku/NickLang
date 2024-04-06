import { VarType } from "./frontend/ast.ts";
import { tokenize } from "./frontend/lexer.ts";
import Parser from "./frontend/parser.ts";
import Environment, { createGlobalEnv } from "./runtime/environments.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_NULL, MK_NUMBER, MK_BOOL } from "./runtime/values.ts";

run("./templates/test3.nl");
async function run(filename: string) {
  const parser = new Parser();
  const env = createGlobalEnv();
  const input = await Deno.readTextFile(filename);

  const program = parser.produceAST(input);

  const result = evaluate(program, env);
  console.log(result);
}

function repl() {
  const parser = new Parser();
  const env = createGlobalEnv();
  console.log("\nRepl v0.1");

  while (true) {
    const env = createGlobalEnv();
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    console.log(result);
  }
}
