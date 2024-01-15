import { useRef } from "react";
import { inject, observer } from "mobx-react";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";

const Table = ({
  historyUsers,
  sectionWidth,
  viewAs,
  setViewAs,
  theme,
  currentDeviceType,
}) => {
  const ref = useRef(null);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return historyUsers && historyUsers.length > 0 ? (
    <TableContainer forwardedRef={ref}>
      <TableHeader sectionWidth={sectionWidth} containerRef={ref} />
      <TableBody>
        {historyUsers.map((item) => (
          <TableRow theme={theme} key={item.id} item={item} />
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
    historyUsers: security.loginHistory.users,
    theme,
    viewAs,
    setViewAs,
    currentDeviceType,
  };
})(observer(Table));
