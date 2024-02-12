const combineUrl = (host = "", ...params: (string | number | undefined)[]) => {
  let url = host.replace(/\/+$/, "");

  params.forEach((part) => {
    if (!part) return;
    const newPart =
      typeof part === "string" ? part.trim().replace(/^\/+/, "") : String(part);
    url += newPart
      ? url.length > 0 && url[url.length - 1] === "/"
        ? newPart
        : `/${newPart}`
      : "";
  });

  return url;
};

export { combineUrl };
