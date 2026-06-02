// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";

import styles from "./SdkIframe.module.scss";

type SdkFrameEvent = { event?: string; data?: unknown };

export type SdkIframeHandle = {
  call: (methodName: string, data?: unknown) => void;
};

type SdkNavigateExtra = {
  pathname?: string;
  search?: string;
};

type SdkIframeProps = {
  src: string;
  title: string;
  // `extra` carries `pathname` / `search` so consumers that need the full
  // iframe location (e.g. ai-agents distinguishing `/123?tab=chat` vs a
  // section) can read them. Section-only consumers (ai-forms) ignore it.
  onNavigate?: (section: string, extra?: SdkNavigateExtra) => void;
  onFilterSearch?: (search: string) => void;
  apiRef?: React.MutableRefObject<SdkIframeHandle | null>;
};

export const SdkIframe = ({
  src,
  title,
  onNavigate,
  onFilterSearch,
  apiRef,
}: SdkIframeProps) => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);

  React.useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      call: (methodName, data) => {
        const target = iframeRef.current?.contentWindow;
        if (!target) return;
        target.postMessage(
          JSON.stringify({ data: { methodName, data } }),
          "*",
        );
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  React.useEffect(() => {
    if (!onNavigate && !onFilterSearch) return undefined;

    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;

      let payload: { type?: string; eventReturnData?: SdkFrameEvent };
      try {
        payload =
          typeof e.data === "string" ? JSON.parse(e.data) : (e.data as never);
      } catch {
        return;
      }

      if (payload?.type !== "onEventReturn") return;
      const eventData = payload.eventReturnData;

      if (eventData?.event === "onFilterSearch" && onFilterSearch) {
        const data = eventData.data as { search?: string } | undefined;
        onFilterSearch(data?.search ?? "");
        return;
      }

      if (eventData?.event !== "onNavigate") return;

      const data = eventData.data as
        | { section?: string | null; pathname?: string; search?: string }
        | undefined;
      const section = typeof data?.section === "string" ? data.section : "";
      // ai-agents may emit onNavigate without a `section` (the section
      // field carries the agent's current tab and is null outside agent
      // detail). Forward the event anyway when `pathname` is present so
      // host wrappers that read pathname can react.
      if (section || data?.pathname) {
        onNavigate?.(section, { pathname: data?.pathname, search: data?.search });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onNavigate, onFilterSearch]);

  return (
    <iframe
      ref={iframeRef}
      className={styles.iframe}
      src={src}
      title={title}
    />
  );
};

export default SdkIframe;
