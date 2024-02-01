import type {
  ContextMenuModel,
  SeparatorType,
} from "../components/context-menu";

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const includesMethod = <T extends Object, MethodName extends string>(
  obj: T,
  method: MethodName,
): obj is T & Record<MethodName, Function> => {
  return method in obj && typeof obj[method as keyof Object] === "function";
};

export const isSeparator = (arg: ContextMenuModel): arg is SeparatorType => {
  return arg?.isSeparator !== undefined && arg.isSeparator;
};

export const isNullOrUndefined = (arg: unknown): arg is null | undefined => {
  return arg === undefined || arg === null;
};
