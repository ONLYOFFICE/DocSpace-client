import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedSize } from "@docspace/common/utils";
import Text from "@docspace/components/text";
import ComboBox from "@docspace/components/combobox";
import StyledBody from "./StyledComponent";
const UsedSpace = (props) => {
  const {
    selection,
    hideColumns,
    isCustomQuota = true,
    setChangeQuotaDialogVisible,
    changeQuotaDialogVisible,
  } = props;
  const [action, setAction] = useState("no-quota");
  const { t } = useTranslation(["Common"]);
  const onQuotaChange = React.useCallback(
    ({ action }) => {
      setAction(action);
      if (action === "edit") {
        setChangeQuotaDialogVisible(true);
        return;
      }
      setChangeQuotaDialogVisible(false);
    },
    [selection]
  );

  const options = [
    {
      id: "info-account-quota_edit",
      key: "edit-quota",
      label: "Edit Quota",
      action: "edit",
    },
    {
      id: "info-account-quota_no-quota",
      key: "no-quota",
      label: "No Quota",
      action: "no-quota",
    },
  ];

  const usedSpace = getConvertedSize(t, 560);
  const spaceLimited = getConvertedSize(t, 4000);

  const selectedOption = isCustomQuota
    ? { title: spaceLimited, label: spaceLimited }
    : options.find((elem) => elem.key === action);

  return (
    <StyledBody hideColumns={hideColumns}>
      <div className="info-account-quota">
        <Text fontWeight={600}>{usedSpace} /</Text>
        <ComboBox
          selectedOption={selectedOption}
          options={options}
          onSelect={onQuotaChange}
          scaled={false}
          size="content"
          displaySelectedOption
          modernView
          isLoading={changeQuotaDialogVisible}
          manualWidth={"fit-content"}
        />
      </div>
    </StyledBody>
  );
};

export default inject(({ dialogsStore }) => {
  const { setChangeQuotaDialogVisible, changeQuotaDialogVisible } =
    dialogsStore;
  return {
    setChangeQuotaDialogVisible,
    changeQuotaDialogVisible,
  };
})(observer(UsedSpace));
