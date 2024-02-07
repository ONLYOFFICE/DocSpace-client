import { useEffect } from "react";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import GroupsFilter from "@docspace/shared/api/groups/filter";

const useGroups = ({
  t,
  isAccountsPage,
  isGroupsAccounts,
  location,

  setIsLoading,

  setSelectedNode,
  fetchGroups,
}) => {
  useEffect(() => {
    if (!isAccountsPage || !isGroupsAccounts) return;
    setIsLoading(true);
    setSelectedNode(["accounts", "groups", "filter"]);

    const newFilter = GroupsFilter.getFilter(location);

    setDocumentTitle(t("Common:Accounts"));

    fetchGroups(newFilter, true)
      .catch((err) => {
        console.err(err);
      })
      .finally(() => setIsLoading(false));
  }, [isAccountsPage, isGroupsAccounts, location.pathname, location.search]);
};

export default useGroups;
