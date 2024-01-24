const combineUrl = (host = "", ...params: string[] | number[]) => {
  let url = host.replace(/\/+$/, "");

  params.forEach((part) => {
    if (!part) return;
    const convertedPart = String(part);
    const newPart = convertedPart.trim().replace(/^\/+/, "");
    url += newPart
      ? url.length > 0 && url[url.length - 1] === "/"
        ? newPart
        : `/${newPart}`
      : "";
  });

  return url;
};

export { combineUrl };
