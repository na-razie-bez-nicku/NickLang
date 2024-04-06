export enum TokenType {
  //Types
  Number,
  String,

  //Keywords
  Const,

  //Identifiers
  Identifier,

  //Operators
  Equals,
  BinaryOperation,

  //Parens
  OpenParen,
  CloseParen,

  //Other
  EOF,
  Var,

  //Seperators
  Dot,
  Semicolon,
  Comma,
  OpenBrace,
  CloseBrace,
  OpenBracket,
  CloseBracket,
  Colon,
}

const KEYWORDS: Record<string, TokenType> = {
  str: TokenType.Var,
  int: TokenType.Var,
  num: TokenType.Var,
  obj: TokenType.Var,
  all: TokenType.Var,
  const: TokenType.Const,
};

/*interface Class {
    members: Array<any> | null,
}

const BUILTINCLASSES: Record<string, Class> = {
    "Con": { members: null },
    
}*/

export interface Token {
  value: string;
  type: TokenType;
  ln: number;
  chr: number;
}

function token(value = "", type: TokenType, ln: number, chr: number) {
  return { value, type, ln, chr };
}

function isalpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

function isskippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

function isint(str: string) {
  const c = str.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

function isnum(str: string, currnumstr: string) {
  if (
    currnumstr.split(".").length == 2 ||
    (currnumstr.split(".").length == 1 && currnumstr.startsWith("."))
  ) {
    const c = str.charCodeAt(0);
    const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
  } else {
    return false;
  }
}

export function tokenize(sourceCode: string): Token[] {
  const tokens = new Array<Token>();
  const src = sourceCode.split("");

  let line = 1;
  let char = 1;

  while (src.length > 0) {
    if (src[0] == "(") {
      tokens.push(token(src.shift(), TokenType.OpenParen, line, char));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift(), TokenType.CloseParen, line, char));
    } else if (src[0] == "{") {
      tokens.push(token(src.shift(), TokenType.OpenBrace, line, char));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift(), TokenType.CloseBrace, line, char));
    } else if (src[0] == "[") {
      tokens.push(token(src.shift(), TokenType.OpenBracket, line, char));
    } else if (src[0] == "]") {
      tokens.push(token(src.shift(), TokenType.CloseBracket, line, char));
    } else if (
      src[0] == "+" ||
      src[0] == "-" ||
      src[0] == "*" ||
      src[0] == "^" ||
      src[0] == "/" ||
      src[0] == "%"
    ) {
      tokens.push(token(src.shift(), TokenType.BinaryOperation, line, char));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift(), TokenType.Equals, line, char));
    } else if (src[0] == ";") {
      tokens.push(token(src.shift(), TokenType.Semicolon, line, char));
    } else if (src[0] == ":") {
      tokens.push(token(src.shift(), TokenType.Colon, line, char));
    } else if (src[0] == ",") {
      tokens.push(token(src.shift(), TokenType.Comma, line, char));
    } else if (src[0] == ".") {
      tokens.push(token(src.shift(), TokenType.Dot, line, char));
    } else {
      if (isint(src[0])) {
        let int = "";
        while (src.length > 0 && isint(src[0])) {
          int += src.shift();
        }
        tokens.push(token(int, TokenType.Number, line, char));
      } else if (isalpha(src[0])) {
        /*else if (isnum(src[0], "")) {
                let num = "";
                while (src.length > 0 && isnum(src[0], num)) {
                    num += src.shift();
                }

                if (num.startsWith(".")) {
                    num = "0" + num;
                }

                tokens.push(token(num, TokenType.Number));
            }*/
        let ident = "";
        while (src.length > 0 && isalpha(src[0])) {
          ident += src.shift();
        }

        const reserved = KEYWORDS[ident];
        if (typeof reserved == "number") {
          tokens.push(token(ident, reserved, line, char));
        } else {
          tokens.push(token(ident, TokenType.Identifier, line, char));
        }
      } else if (isskippable(src[0])) {
        if (src[0] == "\n") {
          line++;
          char = 1;
        }
        src.shift();
      } else {
        console.log(
          'Unreconized character found in source: "' +
            src[0] +
            '" in ' +
            line.toString() +
            ":" +
            char.toString()
        );
        //throw new Error('Unreconized character found in source: "' + src[0] + '" in ' + line.toString() + ':' + char.toString());
        Deno.exit(1);
      }
    }
    char++;
  }

  tokens.push(token("EndOfFile", TokenType.EOF, line, char));

  return tokens;
}

//const source = fs.readFileSync("./Templates/Test2.nl").toString();
/*const source = Deno.readTextFile("./Templates/Test2.nl");

const tokens = tokenize(source)
for (const token of tokens) {
    console.log(token);
}*/
