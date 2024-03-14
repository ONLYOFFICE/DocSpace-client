import React from "react";
import { matchPath } from "react-router";

import AccountsFilter from "@docspace/shared/api/people/filter";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const useInsideGroup = ({
  t,
  groupId,
  location,

  setIsLoading,
  fetchGroup,
  setPortalTariff,
}) => {
  const isInsideGroup = matchPath(
    "/accounts/groups/:groupId/filter",
    location.pathname,
  );

  React.useEffect(() => {
    if (!isInsideGroup || !groupId) return;
    setIsLoading(true);

    const newFilter = AccountsFilter.getFilter(location);

    setDocumentTitle(t("Common:Accounts"));

    fetchGroup(groupId, newFilter, true, true)
      .catch((err) => {
        if (err?.response?.status === 402) setPortalTariff();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [groupId, location.pathname, location.search]);
};

export default useInsideGroup;
