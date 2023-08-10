import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getConvertedQuota } from "@docspace/common/utils";
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
    isDisabledQuotaChange,
    quotaLimit = 0,
    usedQuota = 0,
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

  const usedSpace = getConvertedQuota(t, usedQuota);
  const spaceLimited = getConvertedQuota(t, quotaLimit);

  const selectedOption = isCustomQuota
    ? { title: spaceLimited, label: spaceLimited }
    : options.find((elem) => elem.key === action);

  if (isDisabledQuotaChange) {
    return (
      <StyledBody
        hideColumns={hideColumns}
        isDisabledQuotaChange={isDisabledQuotaChange}
      >
        <Text fontWeight={600}>
          {usedSpace} / {spaceLimited}
        </Text>
      </StyledBody>
    );
  }

  return (
    <StyledBody
      hideColumns={hideColumns}
      isDisabledQuotaChange={isDisabledQuotaChange}
    >
      <Text fontWeight={600}>{usedSpace} / </Text>

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
