import { useRef } from "react";
import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

const Table = ({
  auditTrailUsers,
  sectionWidth,
  viewAs,
  setViewAs,
  theme,
  isSettingNotPaid,
  currentDeviceType,
}) => {
  const ref = useRef(null);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return auditTrailUsers && auditTrailUsers.length > 0 ? (
    <TableContainer forwardedRef={ref}>
      <TableHeader sectionWidth={sectionWidth} containerRef={ref} />
      <TableBody>
        {auditTrailUsers.map((item) => (
          <TableRow
            theme={theme}
            key={item.id}
            item={item}
            isSettingNotPaid={isSettingNotPaid}
          />
        ))}
      </TableBody>
    </TableContainer>
  ) : (
    <div></div>
  );
};

export default inject(({ auth, setup }) => {
  const { security, viewAs, setViewAs } = setup;
  const { theme, currentDeviceType } = auth.settingsStore;

  return {
    auditTrailUsers: security.auditTrail.users,
    theme,
    viewAs,
    setViewAs,
    currentDeviceType,
  };
})(observer(Table));
