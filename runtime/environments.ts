import { VarType } from "../frontend/ast.ts";
import { version } from "../main.ts";
import {
  BooleanVal,
  MK_BOOL,
  MK_NATIVE_CLASS,
  MK_NATIVE_FUNC,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  NullVal,
  NumberVal,
  ObjectVal,
  RuntimeVal,
  StringVal,
} from "./values.ts";

function get_args(arg: RuntimeVal): string {
  const farg = arg as NumberVal | BooleanVal | NullVal | StringVal | ObjectVal;
  let text = "";
  if (farg.type == "object") {
    text += "{ ";
    let i = 0;
    for (const prop of farg.properties) {
      i++;
      if (prop[1].type == "object") {
        text += prop[0] + ": ";
        text += get_args(prop[1]);
      } else {
        //, prop[1], prevProp?: RuntimeVal
        text += `${prop[0]}: ${
          (prop[1] as NumberVal | BooleanVal | NullVal).value
        }`;
      }
      if (farg.properties.size != i) {
        text += ", ";
      }
    }
    text += " }";
  } else {
    text = (arg as NumberVal | BooleanVal | NullVal | StringVal).value;
  }
  return text;
}

export function createGlobalEnv() {
  const env = new Environment();

  env.declareVar("true", MK_BOOL(true), true, "Boolean");
  env.declareVar("false", MK_BOOL(false), true, "Boolean");
  env.declareVar("null", MK_NULL(), true, "Any");

  env.declareVar("_version", MK_STRING(version), true, "String");

  //const mathClass = env.declareVar("Math", MK_NATIVE_CLASS(), true, "Void")

  const MathObject = env.declareVar(
    "Math",
    { type: "object", properties: new Map() } as ObjectVal,
    true,
    "Object"
  ) as ObjectVal;

  MathObject.properties.set("Pi", MK_NUMBER(Math.PI));

  //env.declareVar("Pi", MK_NUMBER(Math.PI), true, "Number");

  const ConObject = env.declareVar(
    "Con",
    { type: "object", properties: new Map() } as ObjectVal,
    true,
    "Object"
  ) as ObjectVal;

  ConObject.properties.set(
    "Prt",
    MK_NATIVE_FUNC((args, scope) => {
      var text = "";
      for (const arg of args) {
        text += get_args(arg);
        //console.log(().value);
      }
      console.log(text);
      return MK_NULL();
    })
  );

  ConObject.properties.set(
    "In",
    MK_NATIVE_FUNC((args, scope) => {
      const arg = args.length > 0 ? get_args(args[0]) : "";
      const value = prompt(arg);

      return MK_STRING(value as string);
    })
  );

  // Define a native built-in method
  // env.declareVar(
  //   "print",
  //   MK_NATIVE_FUNC((args, scope) => {
  //     var text = "";
  //     for (const arg of args) {
  //       text += get_args(arg);
  //       //console.log(().value);
  //     }
  //     console.log(text);
  //     return MK_NULL();
  //   }),
  //   true,
  //   "Void"
  // );

  // env.declareVar(
  //   "input",
  //   MK_NATIVE_FUNC((args, scope) => {
  //     const arg = args.length > 0 ? get_args(args[0]) : "";
  //     const value = prompt(arg);

  //     return MK_STRING(value as string);
  //   }),
  //   true,
  //   "String"
  // );

  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private types: Map<string, VarType>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.types = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean,
    type: VarType
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }
    this.variables.set(varname, value);

    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    if (env.constants.has(varname)) {
      throw `cannot reassign variable ${varname} as it was declared constant.`;
    }
    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) return this;

    if (this.parent == undefined)
      throw `Cannot resolve '${varname}' as it does not exist.`;

    return this.parent.resolve(varname);
  }
}
