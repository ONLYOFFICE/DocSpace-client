import { inject, observer } from "mobx-react";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import RowContainer from "@docspace/components/row-container";

import { HistoryUserRow } from "./HistoryUserRow";

const HistoryRowContainer = ({
  viewAs,
  setViewAs,
  historyUsers,
  theme,
  sectionWidth,
  currentDeviceType,
}) => {
  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

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
