import { VarType } from "../frontend/ast.ts";
import { MK_BOOL, MK_NATIVE_FUNC, MK_NULL, RuntimeVal } from "./values.ts";

export function createGlobalEnv() {
  const env = new Environment();

  env.declareVar("true", MK_BOOL(true), true, "Boolean");
  env.declareVar("false", MK_BOOL(false), true, "Boolean");
  env.declareVar("null", MK_NULL(), true, "All");

  // Define a native built-in method
  env.declareVar(
    "print",
    MK_NATIVE_FUNC((args, scope) => {
      console.log(...args);
      return MK_NULL();
    }),
    true,
    "Void"
  );

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
