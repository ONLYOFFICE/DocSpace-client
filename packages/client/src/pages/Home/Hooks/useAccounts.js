import React from "react";

import AccountsFilter from "@docspace/shared/api/people/filter";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const useAccounts = ({
  t,
  isAccountsPage,
  location,

  setIsLoading,

  setSelectedNode,
  fetchPeople,
  fetchPeopleWithGroups,
  setPortalTariff,
}) => {
  React.useEffect(() => {
    if (!isAccountsPage) return;
    setIsLoading(true);
    setSelectedNode(["accounts", "people", "filter"]);

    const newFilter = AccountsFilter.getFilter(location);

    setDocumentTitle(t("Common:Accounts"));

    if (newFilter?.checkIfFilteredOnlyBySearch()) {
      fetchPeopleWithGroups(newFilter, true).finally(() => {
        setIsLoading(false);
      });

      return;
    }

    fetchPeople(newFilter, true)
      .catch((err) => {
        if (err?.response?.status === 402) setPortalTariff();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAccountsPage, location.pathname, location.search]);
};

export default useAccounts;
