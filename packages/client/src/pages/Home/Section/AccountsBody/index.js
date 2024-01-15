import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useParams } from "react-router-dom";

import Tabs from "./Tabs";
import People from "./People";
import Groups from "./Groups";
import InsideGroup from "./InsideGroup";

import { withTranslation } from "react-i18next";
import { Consumer } from "@docspace/shared/utils";
import withLoader from "SRC_DIR/HOCs/withLoader";

const SectionBodyContent = (props) => {
  const {
    tReady,
    accountsViewAs,
    isFiltered,
    setSelection,
    setBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
  } = props;

  const location = useLocation();
  const { groupId } = useParams();

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);

    if (location?.state?.openChangeOwnerDialog) {
      setChangeOwnerDialogVisible(true);
    }

    if (location?.state?.user) {
      selectUser(location?.state?.user);
    }

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const onMouseDown = (e) => {
    if (
      (e.target.closest(".scroll-body") &&
        !e.target.closest(".user-item") &&
        !e.target.closest(".not-selectable") &&
        !e.target.closest(".info-panel") &&
        !e.target.closest(".table-container_group-menu")) ||
      e.target.closest(".files-main-button") ||
      e.target.closest(".add-button") ||
      e.target.closest(".search-input-block")
    ) {
      setSelection([]);
      setBufferSelection(null);
      window?.getSelection()?.removeAllRanges();
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    if (location?.state?.openChangeOwnerDialog)
      setChangeOwnerDialogVisible(true);

    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <>
      {!isFiltered && <Tabs />}
      {location.pathname.includes("/accounts/people") ? (
        <People />
      ) : !groupId ? (
        <Groups />
      ) : (
        <InsideGroup />
      )}
    </>
  );
};

export default inject(({ peopleStore }) => {
  const { viewAs: accountsViewAs, filterStore } = peopleStore;
  const { isFiltered } = filterStore;

  const { setSelection, setBufferSelection, selectUser } =
    peopleStore.selectionStore;
  const { setChangeOwnerDialogVisible } = peopleStore.dialogStore;

  return {
    accountsViewAs,
    isFiltered,
    setSelection,
    setBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
  };
})(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(SectionBodyContent))()
  )
);
