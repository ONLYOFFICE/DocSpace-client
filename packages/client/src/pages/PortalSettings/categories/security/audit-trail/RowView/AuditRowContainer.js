import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import RowContainer from "@docspace/components/row-container";

import { AuditUserRow } from "./AuditUserRow";

const AuditRowContainer = ({
  viewAs,
  setViewAs,
  auditTrailUsers,
  theme,
  sectionWidth,
  isAuditAvailable,
  currentDeviceType,
}) => {
  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <RowContainer className="history-row-container" useReactWindow={false}>
      {auditTrailUsers.map((item) => (
        <AuditUserRow
          key={item.id}
          theme={theme}
          item={item}
          sectionWidth={sectionWidth}
          isSettingNotPaid={!isAuditAvailable}
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
    auditTrailUsers: security.auditTrail.users,
    theme,
    currentDeviceType,
  };
})(observer(AuditRowContainer));
