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

import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import styles from "./SdkIframe.module.scss";

type SdkFrameEvent = { event?: string; data?: unknown };

export type SdkIframeHandle = {
  call: (methodName: string, data?: unknown) => void;
};

type SdkNavigateExtra = {
  pathname?: string;
  search?: string;
  highlight?: string;
};

type SdkIframeProps = {
  src: string;
  title: string;
  // `extra` carries `pathname` / `search` so consumers that need the full
  // iframe location (e.g. ai-agents distinguishing `/123?tab=chat` vs a
  // section) can read them. Section-only consumers (ai-forms) ignore it.
  onNavigate?: (section: string, extra?: SdkNavigateExtra) => void;
  onFilterSearch?: (search: string) => void;
  // Fired once the SDK app inside the iframe finishes bootstrapping (the
  // `onAppReady` frame event). Optional — section-only consumers ignore it.
  onAppReady?: () => void;
  apiRef?: React.MutableRefObject<SdkIframeHandle | null>;
};

export const SdkIframe = ({
  src,
  title,
  onNavigate,
  onFilterSearch,
  onAppReady,
  apiRef,
}: SdkIframeProps) => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  // While the SDK is routing to a new section we keep the *current*
  // (previous) content on screen, dimmed — instead of letting it flash
  // white. Cleared when the SDK reports the new section is ready
  // (onNavigate / onAppReady).
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      call: (methodName, data) => {
        const target = iframeRef.current?.contentWindow;
        if (!target) return;
        // A section navigation is starting — dim the current content until
        // the SDK reports it settled.
        if (methodName === "navigateSection") setLoading(true);
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
    if (!onNavigate && !onFilterSearch && !onAppReady) return undefined;

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

      // The SDK section finished bootstrapping. Complete the sidebar's
      // "dim" progress animation by firing the same global event the
      // regular client uses on load completion (Home/View dispatches it on
      // `!isLoading`). Fires once per iframe mount, so app->app switches
      // (which mount a fresh iframe) complete here; in-iframe section
      // switches complete via the onNavigate branch below.
      if (eventData?.event === "onAppReady") {
        setLoading(false);
        window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
        onAppReady?.();
        return;
      }

      if (eventData?.event === "onFilterSearch" && onFilterSearch) {
        const data = eventData.data as { search?: string } | undefined;
        onFilterSearch(data?.search ?? "");
        return;
      }

      if (eventData?.event !== "onNavigate") return;

      const data = eventData.data as
        | {
            section?: string | null;
            pathname?: string;
            search?: string;
            highlight?: string;
          }
        | undefined;
      const section = typeof data?.section === "string" ? data.section : "";
      // ai-agents may emit onNavigate without a `section` (the section
      // field carries the agent's current tab and is null outside agent
      // detail). Forward the event anyway when `pathname` is present so
      // host wrappers that read pathname can react.
      if (section || data?.pathname) {
        // A settled in-iframe section change == the destination finished
        // loading: undim the content and complete the sidebar's progress
        // animation (the iframe stays mounted across these, so onAppReady
        // won't re-fire).
        setLoading(false);
        window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
        onNavigate?.(section, {
          pathname: data?.pathname,
          search: data?.search,
          highlight: data?.highlight,
        });
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onNavigate, onFilterSearch, onAppReady]);

  // Safety net: if the SDK never reports back (error / dropped message),
  // undim after a few seconds so the content can't get stuck dimmed.
  React.useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => setLoading(false), 5000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <iframe
      ref={iframeRef}
      className={`${styles.iframe} ${loading ? styles.dimmed : ""}`}
      src={src}
      title={title}
    />
  );
};

export default SdkIframe;
