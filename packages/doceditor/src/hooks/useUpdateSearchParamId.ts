import React from "react";

const useUpdateSearchParamId = (
  fileId: string | undefined,
  hash?: string | undefined,
) => {
  React.useLayoutEffect(() => {
    if (!fileId) return;

    const url = new URL(window.location.href);
    const id = url.searchParams.get("fileId");

    if (url.searchParams.has("fileid")) url.searchParams.delete("fileid");

    if (id !== fileId) {
      url.searchParams.set("fileId", fileId);
      history.pushState(
        {},
        "",
        `${url.pathname}${url.search}${hash ? hash : ""}`,
      );
    }
  }, [fileId, hash]);
};

export default useUpdateSearchParamId;
