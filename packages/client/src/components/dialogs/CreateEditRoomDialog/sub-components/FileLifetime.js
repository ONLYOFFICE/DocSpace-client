import React, { useState } from "react";
import styled from "styled-components";
import Text from "@docspace/components/text";
import TextInput from "@docspace/components/text-input";
import ComboBox from "@docspace/components/combobox";

const StyledFileLifetime = styled.div`
  margin-top: 12px;

  .virtual-data-room_file-lifetime_body {
    display: flex;
    align-items: center;

    .virtual-data-room_file-lifetime_input {
      min-width: 150px;
      margin-right: 4px;
    }

    .virtual-data-room_file-lifetime_combo-box {
      margin-right: 16px;
      width: 90px;
    }
  }
`;

const FileLifetime = ({ t }) => {
  const [inputValue, setInputValue] = useState("");
  const onChange = (e) => {
    // /^(?:[1-9][0-9]*|0)$/
    if (e.target.value && !/^(?:[1-9][0-9]*)$/.test(e.target.value)) return;

    setInputValue(e.target.value);
  };

  const isLoading = false;

  const onSelectDate = (option) => {
    console.log("onDateSelect", option);
  };

  const onSelectDelete = (option) => {
    console.log("onSelectDelete", option);
  };

  const dateOptions = [
    {
      key: 1,
      label: t("Common:Days"),
      "data-type": 1,
    },
    {
      key: 2,
      label: t("Common:Months"),
      "data-type": 2,
    },
    {
      key: 3,
      label: t("Common:Years"),
      "data-type": 3,
    },
  ];

  const deleteOptions = [
    {
      key: 1,
      label: t("Common:MoveToTrash"),
      "data-type": 1,
    },
    {
      key: 2,
      label: t("Common:DeletePermanently"),
      "data-type": 2,
    },
  ];

  return (
    <StyledFileLifetime className="virtual-data-room_file-lifetime">
      <Text fontWeight={600} fontSize="13px">
        {t("FilesOlderThan")}
      </Text>

      <div className="virtual-data-room_file-lifetime_body">
        <TextInput
          className="virtual-data-room_file-lifetime_input"
          isAutoFocussed={true}
          isDisabled={isLoading}
          tabIndex={1}
          value={inputValue}
          onChange={onChange}
          scale
        />
        <ComboBox
          className="virtual-data-room_file-lifetime_combo-box"
          options={dateOptions}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={dateOptions[0]}
          scaledOptions={true}
          onSelect={onSelectDate}
        />
        <ComboBox
          options={deleteOptions}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={deleteOptions[0]}
          scale
          onSelect={onSelectDelete}
        />
      </div>
    </StyledFileLifetime>
  );
};

export default FileLifetime;
