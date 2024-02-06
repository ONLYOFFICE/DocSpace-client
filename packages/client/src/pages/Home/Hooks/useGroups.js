import { useEffect } from "react";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const useGroups = ({
  t,
  isAccountsPage,
  location,

  setIsLoading,

  setSelectedNode,
  fetchGroups,
}) => {
  useEffect(() => {
    if (!isAccountsPage) return;
    setIsLoading(true);
    setSelectedNode(["accounts", "groups", "filter"]);

    setDocumentTitle(t("Common:Accounts"));

    fetchGroups()
      .catch((err) => {
        console.err(err);
      })
      .finally(() => setIsLoading(false));
  }, [isAccountsPage, location.pathname, location.search]);
};

export default useGroups;
