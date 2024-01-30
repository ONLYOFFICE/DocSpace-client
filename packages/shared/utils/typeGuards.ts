export const isNumber = (value: unknown): value is number => {
  return typeof value === "number";
};

export const includesMethod = <T extends Object, MethodName extends string>(
  obj: T,
  method: MethodName,
): obj is T & Record<MethodName, Function> => {
  return method in obj && typeof obj[method as keyof Object] === "function";
};
