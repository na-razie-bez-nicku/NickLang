import { Stmt, VarType } from "../frontend/ast.ts";
import Environment from "./environments.ts";

export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "native-func"
  | "native-class"
  | "func";

export interface RuntimeVal {
  type: ValueType;
  return_type: VarType;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL(n = 0) {
  return { value: null, type: "null" } as NullVal;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true) {
  return { value: b, type: "boolean" } as BooleanVal;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export function MK_NUMBER(n: number = 0) {
  return { value: n, type: "number" } as NumberVal;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
  var_type: "Object";
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFuncValue extends RuntimeVal {
  type: "native-func";
  parent?: string;
  call: FunctionCall;
}

export function MK_NATIVE_FUNC(call: FunctionCall, parent?: string) {
  return { type: "native-func", call, parent } as NativeFuncValue;
}

export interface FuncValue extends RuntimeVal {
  type: "func";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}

export interface NativeClassValue extends RuntimeVal {
  type: "native-class";
  parent?: string;
  name: string;
}

export function MK_NATIVE_CLASS(name: string, parent?: string) {
  return { type: "native-class", name, parent };
}
