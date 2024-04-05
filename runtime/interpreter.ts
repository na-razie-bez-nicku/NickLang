import { NumberVal, RuntimeVal, NullVal, MK_NULL } from "./values.ts";
import {
  BinaryExpr,
  Identifier,
  NumericLiteral,
  Program,
  Stmt,
  VarDeclaration,
} from "../frontend/ast.ts";
import Environment from "./environments.ts";
import { eval_binary_expr, eval_identifier } from "./eval/expressions.ts";
import { eval_program } from "./eval/statements.ts";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "Program":
      return eval_program(astNode as Program, env);
    case "VarDeclaration":
      return eval_var_zdeclaration(astNode as VarDeclaration, env);
    default:
      console.error(
        "This AST Node has not yet been setup for interpretation.",
        astNode
      );
      Deno.exit(1);
  }
}
function eval_var_declaration(
  arg0: VarDeclaration,
  env: Environment
): RuntimeVal {
  throw new Error("Function not implemented.");
}
