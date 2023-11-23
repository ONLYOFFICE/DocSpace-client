export function classNames(...args: string[] | number[] | {}[]) {
  if (args) {
    let classes: any = [];

    for (let i = 0; i < args.length; i++) {
      let className = args[i];

      if (!className) continue;

      const type = typeof className;

      if (type === "string" || type === "number") {
        classes.push(className);
      } else if (type === "object") {
        const _classes = Array.isArray(className)
          ? className
          : Object.entries(className).map(([key, value]) =>
              !!value ? key : null
            );

        classes = _classes.length
          ? classes.concat(_classes.filter((c) => !!c))
          : classes;
      }
    }

    return classes.join(" ");
  }

  return null;
}
