export type NodeType =
  // STATEMENTS
  | "Program"
  | "VarDeclaration"
  | "FuncDeclaration"

  //EXPRESSIONS
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"
  | "ReturnExpr"

  //LITERALS
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "StringLiteral"
  | "Identifier"
  | "BinaryExpr";

export type VarType =
  | "Integer"
  | "Number"
  | "Boolean"
  | "String"
  | "Object"
  | "Any"
  | "Void"
  | "Custom";

export interface Stmt {
  kind: NodeType;
}

export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  constant: boolean;
  type: VarType;
  identifier: string;
  value?: Expr;
}

export interface FuncDeclaration extends Stmt {
  kind: "FuncDeclaration";
  params: string[]; //Map<string, VarType>;
  return_type: VarType;
  name: string;
  body: Stmt[];
  //return?: Expr;
}

export interface Expr extends Stmt {}

export interface ReturnExpr extends Expr {
  kind: "ReturnExpr";
  return_expr: Expr;
}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}
