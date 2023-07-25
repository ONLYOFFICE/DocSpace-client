import {
  useContext,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { inject, observer } from "mobx-react";

import { Context } from "@docspace/components/utils/context";

import withDashboardLoader from "SRC_DIR/HOCs/withDashboardLoader";

import List from "./List";
import Table from "./Table";
import Board from "./Board";

import DashboardProps from "./Dashboard.props";
import type { ContextType } from "./types";
import type { StoreType } from "SRC_DIR/types";

const view: Record<string, typeof List | typeof Table | typeof Board> = {
  row: List,
  table: Table,
  dashboard: Board,
};

function Dashboard({
  viewAs,
  roles,
  userID,
  getModel,
  setViewAs,
  clearSelectedRoleMap,
  clearBufferSelectionRole,
  clearSelectedFileByRoleMap,
}: DashboardProps) {
  const { sectionWidth } = useContext<ContextType>(Context);

  const onMouseDownOutSide = useCallback((event: MouseEvent) => {
    if (
      !(event.target instanceof HTMLElement) ||
      (!event.target.classList.contains("section-wrapper") &&
        !(event.target.dataset.id === "board"))
    ) {
      return;
    }
    clearSelectedRoleMap();
    clearBufferSelectionRole();
    clearSelectedFileByRoleMap();
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

  const View = useMemo(() => view[viewAs], [viewAs]);

  return (
    <>
      <View
        key={`view-${viewAs}`}
        roles={roles}
        userID={userID}
        getModel={getModel}
        sectionWidth={sectionWidth}
        clearSelectedFileByRoleMap={clearSelectedFileByRoleMap}
      />
    </>
  );
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
      clearSelectedFileByRoleMap,
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
      clearSelectedFileByRoleMap,
      userID,
      getModel,
    };
  }
)(observer(withDashboardLoader(Dashboard)));
