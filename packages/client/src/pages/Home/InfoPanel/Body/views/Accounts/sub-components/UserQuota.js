import React, { useState } from "react";

import { getConvertedSize } from "@docspace/common/utils";
import Text from "@docspace/components/text";
import ComboBox from "@docspace/components/combobox";
const UserQuota = (props) => {
  const { selection, t, isCustomQuota = true } = props;
  const [action, setAction] = useState("no-quota");

  const isEditingQuota = action === "edit";

  const onQuotaChange = React.useCallback(
    ({ action }) => {
      setAction(action);
    },
    [selection]
  );
  const renderQuotaComponent = () => {
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

    const usedSpace = getConvertedSize(t, selection.usedSpace);
    const spaceLimited = getConvertedSize(t, selection.quotaLimit);

    const selectedOption = isCustomQuota
      ? { title: spaceLimited, label: spaceLimited }
      : options.find((elem) => elem.key === action);

    return (
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
          isLoading={isEditingQuota}
          manualWidth={"fit-content"}
        />
      </div>
    );
  };

  const quotaComponent = renderQuotaComponent();

  return (
    <>
      <Text className={"info_field"} noSelect title={"Quota"}>
        {"Quota"}
      </Text>
      {quotaComponent}
    </>
  );
};

export default UserQuota;
