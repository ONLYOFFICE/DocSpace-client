import React from "react";

export const getSideInfo = (
  content: React.ReactNode[],
  convert: boolean,
  interfaceDirection: string = "ltr",
) => {
  const info: React.ReactElement[] = [];
  let child = null;
  const lastIndex = content.length - 1;

  content.forEach((element: React.ReactNode, index: number) => {
    if (index > 1) {
      if (!convert && index === lastIndex) {
        child = element;
      } else if (React.isValidElement(element) && "props" in element) {
        info.push(element.props.children);
      }
    }
  });

  if (interfaceDirection === "rtl") {
    info.reverse();
  }

  return interfaceDirection === "ltr" ? (
    <>
      {info.join(" | ")}
      {child}
    </>
  ) : (
    <>
      {child}
      {info.join(" | ")}
    </>
  );
};
