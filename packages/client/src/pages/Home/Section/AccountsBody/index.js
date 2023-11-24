import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router-dom";

import Tabs from "./Tabs";
import People from "./People";
import Groups from "./Groups";

const SectionBodyContent = ({
  setSelection,
  setBufferSelection,
  setChangeOwnerDialogVisible,
}) => {
  const location = useLocation();

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
      <Tabs />
      {location.pathname.includes("/accounts/people") ? <People /> : <Groups />}
    </>
  );
};

export default inject(({ peopleStore }) => ({
  setSelection: peopleStore.selectionStore.setSelection,
  setBufferSelection: peopleStore.selectionStore.setBufferSelection,
  setChangeOwnerDialogVisible:
    peopleStore.dialogStore.setChangeOwnerDialogVisible,
}))(observer(SectionBodyContent));
