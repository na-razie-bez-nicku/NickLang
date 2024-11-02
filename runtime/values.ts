import { Stmt, VarType } from "../frontend/ast.ts";
import Environment from "./environments.ts";

export type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "string"
  | "object"
  | "member"
  | "native-func"
  | "native-class"
  | "func";

export interface RuntimeVal {
  type: ValueType;
  return_type: VarType;
  parent?: RuntimeVal;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL(n = 0, parent?: RuntimeVal) {
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

export function MK_NUMBER(n: number = 0, parent?: RuntimeVal) {
  return { value: n, type: "number" } as NumberVal;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_STRING(n: string = "", parent?: RuntimeVal) {
  return { value: n, type: "string" } as StringVal;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
  var_type: "Object";
}

export interface MemberVal extends RuntimeVal {
  type: "member";
  identifier: RuntimeVal;
  value: RuntimeVal;
  var_type: "Any";
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFuncValue extends RuntimeVal {
  type: "native-func";
  call: FunctionCall;
}

export function MK_NATIVE_FUNC(call: FunctionCall, parent?: RuntimeVal) {
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
}

export function MK_NATIVE_CLASS(parent?: RuntimeVal) {
  return { type: "native-class", parent } as NativeClassValue;
}
