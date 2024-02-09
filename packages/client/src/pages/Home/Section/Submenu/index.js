import AccountsSubmenu from "./AccountsSubmenu";
import MyDocumentsSubmenu from "./MyDocumentsSubmenu";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router-dom";

const SectionSubmenuContent = ({ isPersonalRoom, isRecentTab }) => {
  const location = useLocation();
  const isAccounts = location.pathname.includes("/accounts");

  if (isPersonalRoom || isRecentTab) return <MyDocumentsSubmenu />;
  if (isAccounts) return <AccountsSubmenu />;
  return null;
};

export default inject(({ treeFoldersStore }) => ({
  isPersonalRoom: treeFoldersStore.isPersonalRoom,
  isRecentTab: treeFoldersStore.isRecentTab,
}))(observer(SectionSubmenuContent));
