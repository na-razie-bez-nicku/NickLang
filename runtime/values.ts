export type ValueType = "null" | "number" | "boolean" | "object";

export interface RuntimeVal {
  type: ValueType;
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
