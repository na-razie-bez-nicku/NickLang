import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLiteral,
} from "../../frontend/ast.ts";
import Environment from "../environments.ts";
import { evaluate } from "../interpreter.ts";
import {
  FuncValue,
  MK_NULL,
  NativeFuncValue,
  NumberVal,
  ObjectVal,
  RuntimeVal,
} from "../values.ts";

export function eval_numeric_binary_expr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
): NumberVal {
  let result = 0;
  if (operator == "+") result = lhs.value + rhs.value;
  else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "^") {
    result = Math.pow(lhs.value, rhs.value);
  } else if (operator == "/") {
    result = lhs.value / rhs.value;
  } else if (operator == "%") {
    result = lhs.value % rhs.value;
  }
  return { value: result, type: "number" };
}

export function eval_binary_expr(
  binop: BinaryExpr,
  env: Environment
): RuntimeVal {
  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    return eval_numeric_binary_expr(
      lhs as NumberVal,
      rhs as NumberVal,
      binop.operator
    );
  }
  return MK_NULL();
}

export function eval_identifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  const val = env.lookupVar(ident.symbol);
  return val;
}

export function eval_assignment(
  node: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (node.assigne.kind !== "Identifier")
    throw `Invalid LHS inside assignment expr ${JSON.stringify(node.assigne)}`;

  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function eval_object_expr(obj: ObjectLiteral, env): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;

  for (const { key, value } of obj.properties) {
    const runtimeVal =
      value == undefined ? env.lookupVar(key) : evaluate(value, env);
    object.properties.set(key, runtimeVal);
  }
  return object;
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const func = evaluate(expr.caller, env);

  if (func.type == "native-func") {
    const result = (func as NativeFuncValue).call(args, env);

    return result;
  }

  if (func.type == "func") {
    const fun = func as FuncValue;
    const scope = new Environment(fun.declarationEnv);

    for (let i = 0; i < fun.parameters.length; i++) {
      const varname = fun.parameters[i];

      scope.declareVar(varname, args[i], false, "All");
    }

    let result: RuntimeVal = MK_NULL();
    for (const stmt of fun.body) {
      result = evaluate(stmt, scope);
    }

    return result;
  }
  throw "Cannot call value that is not a function: " + JSON.stringify(func);
}
