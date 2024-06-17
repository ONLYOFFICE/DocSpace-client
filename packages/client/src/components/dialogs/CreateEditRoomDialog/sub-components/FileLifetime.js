import { useState } from "react";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { TextInput } from "@docspace/shared/components/text-input";
import { ComboBox } from "@docspace/shared/components/combobox";
import { mobile } from "@docspace/shared/utils/device";

const StyledFileLifetime = styled.div`
  margin-top: 12px;

  .virtual-data-room_file-lifetime_body {
    display: flex;
    align-items: center;

    @media ${mobile} {
      display: block;
    }

    .virtual-data-room_file-lifetime_date {
      display: flex;
      align-items: center;
    }

    .virtual-data-room_file-lifetime_input {
      min-width: 150px;
      margin-right: 4px;

      @media ${mobile} {
        margin-right: 8px;
        width: 165px;
      }
    }

    .virtual-data-room_file-lifetime_combo-box {
      margin-right: 16px;
      width: 92px;
      min-width: 92px;

      @media ${mobile} {
        margin-right: 0px;
        width: 165px;
      }
    }
  }
`;

const FileLifetime = ({ t, roomParams, setRoomParams }) => {
  const lifetime = roomParams.lifetime ?? {
    value: "12",
    deletePermanently: false,
    period: 0,
  };

  const dateOptions = [
    {
      key: 1,
      label: t("Common:Days")[0].toUpperCase() + t("Common:Days").slice(1),
      value: 0,
    },
    {
      key: 2,
      label: t("Common:Months"),
      value: 1,
    },
    {
      key: 3,
      label: t("Common:Years"),
      value: 2,
    },
  ];

  const deleteOptions = [
    {
      key: 1,
      label: t("Common:MoveToTrash"),
      value: false,
    },
    {
      key: 2,
      label: t("Common:DeletePermanently"),
      value: true,
    },
  ];

  const selectedInputValue = lifetime.value + "";
  const selectedDateOption = dateOptions.find(
    (o) => o.value === lifetime.period,
  );
  const selectedDeleteOptions = lifetime.deletePermanently
    ? deleteOptions[1]
    : deleteOptions[0];

  const [inputValue, setInputValue] = useState(selectedInputValue);
  const [selectedDate, setSelectedDate] = useState(selectedDateOption);
  const [selectedDelete, setSelectedDelete] = useState(selectedDeleteOptions);

  const onChange = (e) => {
    // /^(?:[1-9][0-9]*|0)$/
    if (e.target.value && !/^(?:[1-9][0-9]*)$/.test(e.target.value)) return;

    setInputValue(e.target.value);

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, value: +e.target.value },
    });
  };

  const isLoading = false;

  const onSelectDate = (option) => {
    setSelectedDate(option);

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, period: option.value },
    });
  };

  const onSelectDelete = (option) => {
    setSelectedDelete(option);

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, deletePermanently: option.value },
    });
  };

  return (
    <StyledFileLifetime className="virtual-data-room_file-lifetime">
      <Text fontWeight={600} fontSize="13px">
        {t("FilesOlderThan")}
      </Text>

      <div className="virtual-data-room_file-lifetime_body">
        <div className="virtual-data-room_file-lifetime_date">
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
            selectedOption={selectedDate}
            scaledOptions={true}
            onSelect={onSelectDate}
          />
        </div>
        <ComboBox
          options={deleteOptions}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={selectedDelete}
          scale
          onSelect={onSelectDelete}
        />
      </div>
    </StyledFileLifetime>
  );
};

export default FileLifetime;
