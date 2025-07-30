import React from "react";

const useUpdateSearchParamId = (
  fileId: string | undefined,
  hash?: string | undefined,
) => {
  React.useLayoutEffect(() => {
    if (!fileId) return;

    const url = new URL(window.location.href);
    const id = url.searchParams.get("fileId");

    const urlHash = hash ?? url.hash;

    if (url.searchParams.has("fileid")) url.searchParams.delete("fileid");

    if (id !== fileId) {
      url.searchParams.set("fileId", fileId);
      window.history.pushState(
        {},
        "",
        `${url.pathname}${url.search}${urlHash || ""}`,
      );
    }
  }, [fileId, hash]);
};

export default useUpdateSearchParamId;
