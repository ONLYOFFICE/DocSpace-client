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
import PeopleWithGroups from "SRC_DIR/pages/Home/Section/AccountsBody/PeopleWithGroups";

const SectionBodyContent = (props) => {
  const {
    tReady,
    accountsViewAs,
    isFiltered,
    setPeopleSelection,
    setGroupsSelection,
    setPeopleBufferSelection,
    setGroupsBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
    isFilteredOnlyBySearch,
    peopleWithGroups,
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
        !e.target.closest(".group-item") &&
        !e.target.closest(".not-selectable") &&
        !e.target.closest(".info-panel") &&
        !e.target.closest(".table-container_group-menu")) ||
      e.target.closest(".files-main-button") ||
      e.target.closest(".add-button") ||
      e.target.closest(".search-input-block")
    ) {
      setPeopleSelection([]);
      setGroupsSelection([]);
      setPeopleBufferSelection(null);
      setGroupsBufferSelection(null);
      window?.getSelection()?.removeAllRanges();
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);
    if (location?.state?.openChangeOwnerDialog)
      setChangeOwnerDialogVisible(true);

    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  if (isFilteredOnlyBySearch) {
    return <PeopleWithGroups />;
  }

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
  const { viewAs: accountsViewAs, filterStore, peopleWithGroups } = peopleStore;
  const { isFiltered, isFilteredOnlyBySearch } = filterStore;

  const {
    setSelection: setPeopleSelection,
    setBufferSelection: setPeopleBufferSelection,
    selectUser,
  } = peopleStore.selectionStore;

  const {
    setSelection: setGroupsSelection,
    setBufferSelection: setGroupsBufferSelection,
  } = peopleStore.groupsStore;

  const { setChangeOwnerDialogVisible } = peopleStore.dialogStore;

  return {
    accountsViewAs,
    isFiltered,
    isFilteredOnlyBySearch,
    setPeopleSelection,
    setGroupsSelection,
    setPeopleBufferSelection,
    setGroupsBufferSelection,
    setChangeOwnerDialogVisible,
    selectUser,
    peopleWithGroups,
  };
})(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(SectionBodyContent))(),
  ),
);
