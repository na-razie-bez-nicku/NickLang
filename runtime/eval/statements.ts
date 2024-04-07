import {
  FuncDeclaration,
  Program,
  VarDeclaration,
} from "../../frontend/ast.ts";
import { FuncValue, MK_NULL, NativeFuncValue, RuntimeVal } from "../values.ts";
import Environment from "../environments.ts";
import { evaluate } from "../interpreter.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();
  return env.declareVar(
    declaration.identifier,
    value,
    declaration.constant,
    declaration.type
  );
}

export function eval_func_declaration(
  declaration: FuncDeclaration,
  env: Environment
): RuntimeVal {
  const func = {
    type: "func",
    name: declaration.name,
    parameters: declaration.params,
    return_type: "All",
    declarationEnv: env,
    body: declaration.body,
  } as FuncValue;

  env.declareVar(declaration.name, func, true, func.return_type);
}
