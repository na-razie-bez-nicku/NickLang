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
  CallExpr,
  MemberExpr,
  FuncDeclaration,
  StringLiteral,
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
      case TokenType.Func:
        return this.parse_func_declaration();
      // case TokenType.Return:
      //   return this.parse_return();
      default:
        return this.parse_expr();
    }
  }
  //parse_return(): Stmt {}
  private parse_func_declaration(): Stmt {
    this.eat();
    const name = this.expect(
      TokenType.Identifier,
      "Expected function name following keyword."
    ).value;

    const args = this.parse_args();
    const params: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.log(arg);
        throw "Inside function declaration expected parameters to be of type string.";
      }

      params.push((arg as Identifier).symbol);
    }

    this.expect(
      TokenType.OpenBrace,
      "Expected function body following declaration"
    );

    const body: Stmt[] = [];

    while (
      this.at().type !== TokenType.EOF &&
      this.at().type !== TokenType.CloseBrace &&
      this.at().type !== TokenType.Return
    ) {
      body.push(this.parse_stmt());
    }

    if (this.at().type === TokenType.Return) {
      this.eat();
      const retExpr = this.parse_expr();

      const fn = {
        body,
        name,
        params,
        kind: "FuncDeclaration",
        return: retExpr,
      } as FuncDeclaration;

      return fn;
    }
    this.expect(
      TokenType.CloseBrace,
      "Closing brace expected inside function declaration."
    );

    const fn = {
      body,
      name,
      params,
      kind: "FuncDeclaration",
    } as FuncDeclaration;

    return fn;
  }
  parse_return_expr(): Expr {
    while (this.at().type !== TokenType.Semicolon) {

    }
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();
    if (this.at().type == TokenType.Equals) {
      this.eat();
      const value = this.parse_assignment_expr();
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
        properties.push({ key: key, kind: "Property" });
        continue;
      }

      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in ObjectExpr"
      );
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing bracket following property"
        );
      }
    }
    this.expect(TokenType.CloseBrace, "Object literal missing closing brace");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.at().type == TokenType.Const;

    let type;
    let identifier;

    if (isConstant) {
      this.eat();
      identifier = this.expect(
        TokenType.Identifier,
        "Expected identifier name."
      ).value;
    } else {
      type = this.expect(TokenType.Var, "Expected 'var' keyword.").value;
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

    // switch (type) {
    //   case "int":
    //     var_type = "Integer";
    //     break;
    //   case "num":
    //     var_type = "Number";
    //     break;
    //   case "str":
    //     var_type = "String";
    //     break;
    //   case "obj":
    //     var_type = "Object";
    //   case "any":
    //     var_type = "Any";
    // }

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
    let left = this.parse_call_member_expr();

    while (
      this.at().value == "*" ||
      this.at().value == "/" ||
      this.at().value == "^" ||
      this.at().value == "%"
    ) {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }
  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();
    this.expect(
      TokenType.CloseParen,
      "Missing closing parenthesis inside arguments list"
    );

    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args = [this.parse_expr()];

    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  private parse_member_expr(): Expr {
    let object = this.parse_primary_expr();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const operator = this.eat();

      let property: Expr;
      let computed: boolean;

      if (operator.type == TokenType.Dot) {
        computed = false;
        property = this.parse_primary_expr();

        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand side being a identifier`;
        }
      } else {
        computed = true;
        property = this.parse_expr();

        this.expect(
          TokenType.CloseBracket,
          "Missing closing bracket in computed value"
        );
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }
    return object;
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
      case TokenType.Text:
        return {
          kind: "StringLiteral",
          value: this.eat().value,
        } as StringLiteral;
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
