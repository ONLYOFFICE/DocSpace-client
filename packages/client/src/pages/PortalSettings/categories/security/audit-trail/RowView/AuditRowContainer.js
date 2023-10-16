import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import RowContainer from "@docspace/components/row-container";

import { AuditUserRow } from "./AuditUserRow";
import { DeviceType } from "@docspace/common/constants";

const AuditRowContainer = ({
  viewAs,
  setViewAs,
  auditTrailUsers,
  theme,
  sectionWidth,
  isAuditAvailable,
  currentDeviceType,
}) => {
  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || currentDeviceType !== DeviceType.desktop) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

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
