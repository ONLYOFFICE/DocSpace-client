import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { CategoryType } from "SRC_DIR/helpers/constants";

import type { ParamType } from "../Dashboard/types";
import type { IDashboard } from "@docspace/common/Models";

type useDashboardProps = {
  isDashboardPage: boolean;
  setIsLoading: (predicate: boolean, withTimer?: boolean) => void;
  fetchDashboard: (fileId: number | string) => Promise<IDashboard>;
  setCategoryType: (categoryType: number) => void;
};

function useDashboard({
  isDashboardPage,
  setIsLoading,
  fetchDashboard,
  setCategoryType,
}: useDashboardProps) {
  const { boardId } = useParams<ParamType>();

  useEffect(() => {
    if (!isDashboardPage || !boardId) return;

    setIsLoading(true, false);
    setCategoryType(CategoryType.Dashboard);
    fetchDashboard(boardId).finally(() => {
      setIsLoading(false);
    });
  }, [isDashboardPage]);
}

export default useDashboard;
