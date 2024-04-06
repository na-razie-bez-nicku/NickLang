import {
  Stmt,
  Program,
  Expr,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  VarDeclaration,
  VarType,
  AssignmentExpr,
  Property,
  ObjectLiteral,
} from "./ast.ts";
import { tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  public produceAST(sourceCode: string) {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      Deno.exit(1);
    }

    return prev;
  }

  private parse_stmt(): Stmt {
    switch (this.at().type) {
      case TokenType.Var:
        return this.parse_var_declaration();
      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr();
    }
  }

  private parse_expr(): Expr {
    return this.parse_object_expr();
  }

  private parse_assigment_expr(): Expr {
    const left = this.parse_object_expr();
    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assigment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat();
    const properties = new Array<Property>();
    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;
      if (this.at().type == TokenType.Comma) {
        this.eat();
        properties.push({ key: key, kind: "Property" } as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key: key, kind: "Property" } as Property);
        continue;
      }
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr"
      );
      this.expect(TokenType.CloseBrace, "Object literal missing closing brace");
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property"
        );
      }
    }
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.at().type == TokenType.Const;

    let type;
    let identifier;

    if (isConstant) {
      this.eat();
      type = this.expect(
        TokenType.Var,
        "Expected variable type after const keyword."
      ).value;
      identifier = this.expect(
        TokenType.Identifier,
        "Expected identifier name."
      ).value;
    } else {
      type = this.expect(TokenType.Var, "Expected variable type.").value;
      identifier = this.expect(
        TokenType.Identifier,
        "Expected identifier name."
      ).value;
    }

    if (this.at().type == TokenType.Semicolon) {
      this.eat();
      if (isConstant)
        throw "Must assign value to constant expression. No value provided.";
      return {
        kind: "VarDeclaration",
        identifier,
        constant: false,
      } as VarDeclaration;
    }
    this.expect(TokenType.Equals, "Expected equals token following identifier");
    let var_type;

    switch (type) {
      case "int":
        var_type = VarType.Integer;
        break;
      case "num":
        var_type = VarType.Number;
        break;
      case "str":
        var_type = VarType.String;
        break;
      case "obj":
        var_type = VarType.Array;
    }

    const declaration = {
      kind: "VarDeclaration",
      value: this.parse_expr(),
      identifier,
      type: var_type,
      constant: isConstant,
    } as VarDeclaration;

    this.expect(
      TokenType.Semicolon,
      "Variable declaration statement must end with semicolon."
    );

    return declaration;
  }

  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicative_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "^" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_primary_expr(): Expr {
    const tk = this.at().type;
    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.BinaryOperation:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;
      case TokenType.OpenParen:
        this.eat();

        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis."
        );
        return value;
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }
}
