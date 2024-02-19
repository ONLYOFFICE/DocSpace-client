import React from "react";

import { getLogoUrls } from "@docspace/shared/api/settings";
import { TWhiteLabel } from "@docspace/shared/utils/whiteLabelHelper";

const useWhiteLabel = () => {
  const [logoUrls, setLogoUrls] = React.useState<TWhiteLabel[]>([]);

  const requestRunning = React.useRef(false);
  const alreadyFetched = React.useRef(false);

  const fetchWhiteLabel = React.useCallback(async () => {
    if (alreadyFetched.current) return;

    requestRunning.current = true;
    const urls = await getLogoUrls();
    requestRunning.current = false;
    console.log("====", urls);
    setLogoUrls(urls);
    alreadyFetched.current = true;
  }, []);

  React.useEffect(() => {
    fetchWhiteLabel();
  }, [fetchWhiteLabel]);

  return { logoUrls };
};

export default useWhiteLabel;
