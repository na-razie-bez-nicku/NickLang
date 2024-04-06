import { VarType } from "./frontend/ast.ts";
import { tokenize } from "./frontend/lexer.ts";
import Parser from "./frontend/parser.ts";
import Environment from "./runtime/environments.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { MK_NULL, MK_NUMBER, MK_BOOL } from "./runtime/values.ts";

run("./templates/test3.nl");
async function run(filename: string) {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true, VarType.Boolean);
  env.declareVar("false", MK_BOOL(false), true, VarType.Boolean);
  env.declareVar("null", MK_NULL(), true, VarType.String);

  const input = await Deno.readTextFile(filename);

  let result = tokenize(input);
  console.log(result);

  const program = parser.produceAST(input);

  result = evaluate(program, env);
  console.log(result);
}

function repl() {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true, VarType.Boolean);
  env.declareVar("false", MK_BOOL(false), true, VarType.Boolean);
  env.declareVar("null", MK_NULL(), true, VarType.String);
  console.log("\nRepl v0.1");

  while (true) {
    const input = prompt("> ");

    if (!input || input.includes("exit")) {
      Deno.exit(1);
    }

    const program = parser.produceAST(input);

    const result = evaluate(program, env);
    console.log(result);
  }
}
