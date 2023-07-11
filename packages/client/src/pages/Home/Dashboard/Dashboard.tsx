import { useContext, useLayoutEffect, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { isMobile, isMobileOnly } from "react-device-detect";

import { Context } from "@docspace/components/utils/context";
import Scrollbar from "@docspace/components/scrollbar";

import withDashboardLoader from "SRC_DIR/HOCs/withDashboardLoader";

import List from "./List";
import Table from "./Table";
import Board from "./Board";

import DashboardProps from "./Dashboard.props";
import { ContextType, StoreType } from "./types";

function Dashboard({
  viewAs,
  roles,
  userID,
  getModel,
  setViewAs,
  clearSelectedRoleMap,
  clearBufferSelectionRole,
}: DashboardProps) {
  const { sectionWidth } = useContext<ContextType>(Context);

  const onMouseDownOutSide = useCallback((event: MouseEvent) => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.classList.contains("section-wrapper")
    ) {
      return;
    }
    clearSelectedRoleMap();
    clearBufferSelectionRole();
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDownOutSide);

    return () => {
      clearSelectedRoleMap();
      clearBufferSelectionRole();
      window.removeEventListener("mousedown", onMouseDownOutSide);
    };
  }, []);

  useLayoutEffect(() => {
    if (viewAs === "dashboard") return;

    const width = window.innerWidth;

    setViewAs(width < 1024 ? "row" : "table");
  }, [sectionWidth, viewAs]);

  if (viewAs === "row") {
    return (
      <List sectionWidth={sectionWidth} roles={roles} getModel={getModel} />
    );
  }

  if (viewAs === "table") {
    return (
      <Table
        sectionWidth={sectionWidth}
        roles={roles}
        userID={userID}
        getModel={getModel}
      />
    );
  }

  if (isMobile) {
    return (
      //@ts-ignore
      <Scrollbar
        style={{
          width: sectionWidth,
          height: `calc(100vh  - ${isMobileOnly ? 255 : 155}px)`,
        }}
      >
        <Board roles={roles} getModel={getModel} />
      </Scrollbar>
    );
  }

  return <Board roles={roles} getModel={getModel} />;
}

export default inject<StoreType>(
  ({
    dashboardStore,
    filesStore,
    clientLoadingStore,
    dashboardContextOptionStore,
    auth,
  }) => {
    const {
      viewAs,
      setViewAs,
      roles,
      clearSelectedRoleMap,
      clearBufferSelectionRole,
    } = dashboardStore;

    const { getModel } = dashboardContextOptionStore;

    const { isInit, isLoadingFilesFind } = filesStore;
    const { firstLoad, showBodyLoader } = clientLoadingStore;

    const isLoading =
      isLoadingFilesFind ||
      showBodyLoader ||
      !auth.isLoaded ||
      firstLoad ||
      !isInit;

    const userID = (auth.userStore as any).user.id;

    return {
      viewAs,
      setViewAs,
      roles,
      isLoading,
      clearSelectedRoleMap,
      clearBufferSelectionRole,
      userID,
      getModel,
    };
  }
)(observer(withDashboardLoader(Dashboard)));
