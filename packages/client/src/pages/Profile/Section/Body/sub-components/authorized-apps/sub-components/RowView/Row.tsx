import { useTranslation } from "react-i18next";

import { Row } from "@docspace/shared/components/rows";

import { RowContent } from "./RowContent";
import { RowProps } from "./RowView.types";

export const OAuthRow = (props: RowProps) => {
  const {
    item,
    sectionWidth,

    isChecked,
    inProgress,
    getContextMenuItems,
    setSelection,
    dataTestId,
  } = props;

  const { t } = useTranslation(["OAuth", "Common", "Files"]);

  const contextOptions = getContextMenuItems?.(t, item, false, false) || [];

  const element = (
    <img style={{ borderRadius: "3px" }} src={item.logo} alt="App logo" />
  );

  return (
    <Row
      key={item.clientId}
      contextOptions={contextOptions}
      element={element}
      mode="modern"
      checked={isChecked}
      inProgress={inProgress}
      onSelect={() => setSelection && setSelection(item.clientId)}
      onRowClick={() => {}}
      className={`oauth2-row${isChecked ? " oauth2-row-selected" : ""}`}
      isIndexEditingMode={false}
      dataTestId={dataTestId}
    >
      <RowContent
        sectionWidth={sectionWidth}
        item={item}
        isChecked={isChecked}
        inProgress={inProgress}
        setSelection={setSelection}
      />
    </Row>
  );
};
