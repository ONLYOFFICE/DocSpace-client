import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import RowContainer from "@docspace/components/row-container";

import { HistoryUserRow } from "./HistoryUserRow";
import { DeviceType } from "@docspace/common/constants";

const HistoryRowContainer = ({
  viewAs,
  setViewAs,
  historyUsers,
  theme,
  sectionWidth,
  currentDeviceType,
}) => {
  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || currentDeviceType !== DeviceType.desktop) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth, currentDeviceType]);

  return (
    <RowContainer className="history-row-container" useReactWindow={false}>
      {historyUsers.map((item) => (
        <HistoryUserRow
          key={item.id}
          theme={theme}
          item={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </RowContainer>
  );
};

export default inject(({ setup, auth }) => {
  const { viewAs, setViewAs, security } = setup;
  const { theme, currentDeviceType } = auth.settingsStore;

  return {
    viewAs,
    setViewAs,
    historyUsers: security.loginHistory.users,
    theme,
    currentDeviceType,
  };
})(observer(HistoryRowContainer));
