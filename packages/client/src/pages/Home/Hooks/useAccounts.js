import React from "react";

import AccountsFilter from "@docspace/shared/api/people/filter";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const useAccounts = ({
  t,
  isAccountsPage,
  isPeopleAccounts,
  location,

  setIsLoading,

  setSelectedNode,
  fetchPeople,
  setPortalTariff,
}) => {
  React.useEffect(() => {
    if (!isAccountsPage || !isPeopleAccounts) return;
    setIsLoading(true);
    setSelectedNode(["accounts", "people", "filter"]);

    const newFilter = AccountsFilter.getFilter(location);

    setDocumentTitle(t("Common:Accounts"));

    fetchPeople(newFilter, true, true)
      .catch((err) => {
        if (err?.response?.status === 402) setPortalTariff();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAccountsPage, isPeopleAccounts, location.pathname, location.search]);
};

export default useAccounts;
