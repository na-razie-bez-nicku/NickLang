import { Program } from "../../frontend/ast.ts";
import { MK_NULL, RuntimeVal } from "../values.ts";
import Environment from "../environments.ts";
import { evaluate } from "../interpreter.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}
