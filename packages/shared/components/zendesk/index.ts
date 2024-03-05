import { useEffect, useCallback } from "react";

import { zendeskAPI } from "./Zendesk.utils";

interface Props {
  zendeskKey: string;
  defer?: boolean;
  onLoaded?: () => void;
  config?: {};
}

const Zendesk = ({ zendeskKey, defer, onLoaded, config }: Props) => {
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
      const script = document.createElement("script");
      if (d) {
        script.defer = true;
      } else {
        script.async = true;
      }
      script.id = "ze-snippet";
      script.src = `https://static.zdassets.com/ekr/snippet.js?key=${zdKey}`;
      script.addEventListener("load", onScriptLoaded);
      document.body.appendChild(script);
    },
    [onScriptLoaded],
  );

  useEffect(() => {
    if (typeof window?.document?.createElement !== "undefined" && !window?.zE) {
      insertScript(zendeskKey, defer);

      window.zESettings = { ...(config || {}) };
    }

    return () => {
      if (typeof window?.document?.createElement !== "undefined" && window.zE) {
        // @ts-expect-error its ok
        delete window.zE;
        // @ts-expect-error its ok
        delete window.zESettings;
      }
    };
  }, [zendeskKey, defer, insertScript, config]);

  return null;
};

export { Zendesk };
