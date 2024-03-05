export function classNames(...args: (string | undefined | number | {})[]) {
  if (args) {
    let classes: (string | number)[] = [];

    for (let i = 0; i < args.length; i += 1) {
      const className = args[i];

      if (className) {
        if (typeof className === "string" || typeof className === "number") {
          classes.push(className);
        }
        if (typeof className === "object") {
          const objClasses = Array.isArray(className)
            ? className
            : Object.entries(className).map(([key, value]) =>
                value ? key : null,
              );

          classes = objClasses.length
            ? classes.concat(objClasses.filter((c) => !!c))
            : classes;
        }
      }
    }

    return classes.join(" ");
  }

  return "";
}
