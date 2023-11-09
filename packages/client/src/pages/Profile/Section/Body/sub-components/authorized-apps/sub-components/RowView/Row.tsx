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

  const contextOptions =
    getContextMenuItems && getContextMenuItems(t, item, false, false);

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
        />
      </Row>
    </>
  );
};

export default OAuthRow;
