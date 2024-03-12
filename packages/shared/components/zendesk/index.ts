import { useEffect, useCallback } from "react";

import { zendeskAPI } from "./Zendesk.utils";

interface Props {
  zendeskKey: string;
  defer?: boolean;
  onLoaded?: () => void;
  config?: {};
  isShowLiveChat: boolean;
}

const Zendesk = ({
  zendeskKey,
  defer,
  onLoaded,
  config,
  isShowLiveChat,
}: Props) => {
  const onScriptLoaded = useCallback(() => {
    const waitingChanges = zendeskAPI.getChanges();
    if (waitingChanges.length > 0) {
      waitingChanges.forEach((v) => zendeskAPI.addChanges(...v));
      zendeskAPI.clearChanges();
    }

    if (typeof onLoaded === "function") {
      onLoaded();
    }
  }, [onLoaded]);

  const insertScript = useCallback(
    (zdKey: string, d?: boolean) => {
      const ZENDESK_ID = "ze-snippet";

      const includeScript = Boolean(document?.getElementById(ZENDESK_ID));

      if (includeScript) return;

      const script = document.createElement("script");
      if (d) {
        script.defer = true;
      } else {
        script.async = true;
      }
      script.id = ZENDESK_ID;
      script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zdKey}`;
      script.addEventListener("load", onScriptLoaded);
      document.body.appendChild(script);
    },
    [onScriptLoaded],
  );

  useEffect(() => {
    if (
      typeof window?.document?.createElement !== "undefined" &&
      !window?.zE &&
      isShowLiveChat
    ) {
      insertScript(zendeskKey, defer);

      window.zESettings = { ...(config || {}) };
    }
  }, [zendeskKey, defer, insertScript, config, isShowLiveChat]);

  return null;
};

export { Zendesk };
