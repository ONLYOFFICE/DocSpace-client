import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Row } from "@docspace/shared/components/row";
import { toastr } from "@docspace/shared/components/toast";

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

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const editClient = () => {
    navigate(`${item.clientId}`);
  };

  const handleToggleEnabled = async () => {
    if (!changeClientStatus) return;
    try {
      await changeClientStatus(item.clientId, !item.enabled);

      if (!item.enabled) {
        toastr.success(t("ApplicationEnabledSuccessfully"));
      } else {
        toastr.success(t("ApplicationDisabledSuccessfully"));
      }
    } catch (e) {
      toastr.error(e as string);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    ) {
      return;
    }

    if (
      target.closest(".table-container_row-context-menu-wrapper") ||
      target.closest(".toggleButton") ||
      target.closest(".row_context-menu-wrapper")
    ) {
      return setSelection && setSelection("");
    }

    editClient();
  };

  const contextOptions = getContextMenuItems && getContextMenuItems(t, item);

  const element = (
    <img style={{ borderRadius: "3px" }} src={item.logo} alt="App logo" />
  );

  return (
    <Row
      key={item.clientId}
      contextOptions={contextOptions}
      onRowClick={handleRowClick}
      element={element}
      mode="modern"
      checked={isChecked}
      inProgress={inProgress}
      onSelect={() => setSelection && setSelection(item.clientId)}
      className={`oauth2-row${isChecked ? " oauth2-row-selected" : ""}`}
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
  );
};

export default OAuthRow;
