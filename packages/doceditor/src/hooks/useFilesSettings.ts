import React from "react";

import { getSettingsFiles } from "@docspace/shared/api/files";
import { TFilesSettings } from "@docspace/shared/api/files/types";

const useFilesSettings = ({}) => {
  const [settings, setSettings] = React.useState({} as TFilesSettings);

  const requestRunning = React.useRef(false);

  const initSettings = React.useCallback(async () => {
    if (requestRunning.current) return;

    requestRunning.current = true;

    const res = await getSettingsFiles();

    setSettings(res);
    requestRunning.current = false;
  }, []);

  React.useEffect(() => {
    if (settings.extsArchive) return;
    initSettings();
  }, [initSettings, settings.extsArchive]);

  return { filesSettings: settings };
};

export default useFilesSettings;
