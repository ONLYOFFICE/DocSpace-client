import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";

import TableView from "./TableView";
import RowView from "./RowView";

const SessionsTable = ({
  t,
  viewAs,
  setSelection,
  setBufferSelection,
  sessionsData,
}) => {
  useEffect(() => {
    window.addEventListener("mousedown", onMouseDown);

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
  return (
    <Consumer>
      {(context) =>
        viewAs === "table" ? (
          <TableView
            t={t}
            sectionWidth={context.sectionWidth}
            sessionsData={sessionsData}
          />
        ) : (
          <RowView
            t={t}
            sectionWidth={context.sectionWidth}
            sessionsData={sessionsData}
          />
        )
      }
    </Consumer>
  );
};

export default inject(({ setup, peopleStore }) => {
  const { setSelection, setBufferSelection } = peopleStore.selectionStore;
  const { viewAs } = setup;

  return {
    viewAs,
    setSelection,
    setBufferSelection,
  };
})(observer(SessionsTable));
