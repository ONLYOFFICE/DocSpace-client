import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//@ts-ignore
import Row from "@docspace/components/row";

import { RowContent } from "./RowContent";
import { RowProps } from "./RowView.types";

export const OAuthRow = (props: RowProps) => {
  const {
    item,
    sectionWidth,
    changeClientStatus,
    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
  } = props;
  const navigate = useNavigate();

  const { t } = useTranslation(["Common"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    await changeClientStatus(item.clientId, !item.enabled);
  };

  const handleRowClick = (e: any) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".toggleButton") ||
      e.target.closest(".row_context-menu-wrapper")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems && getContextMenuItems(t, item);

  const element = (
    <img style={{ borderRadius: "3px" }} src={item.logo} alt={"App logo"} />
  );

  return (
    <>
      <Row
        sectionWidth={sectionWidth}
        key={item.clientId}
        data={item}
        contextOptions={contextOptions}
        onClick={handleRowClick}
        element={element}
        mode={"modern"}
        checked={isChecked}
        inProgress={inProgress}
        onSelect={() => setSelection && setSelection(item.clientId)}
      >
        <RowContent
          sectionWidth={sectionWidth}
          item={item}
          isChecked={isChecked}
          inProgress={inProgress}
          setSelection={setSelection}
          handleToggleEnabled={handleToggleEnabled}
        />
      </Row>
    </>
  );
};

export default OAuthRow;
