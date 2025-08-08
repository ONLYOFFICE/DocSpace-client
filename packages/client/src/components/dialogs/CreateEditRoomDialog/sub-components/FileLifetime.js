import { useState, useEffect } from "react";
import styled from "styled-components";
import { capitalize } from "lodash";
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
      gap: 4px;

      @media ${mobile} {
        gap: 8px;
      }
    }

    .virtual-data-room_file-lifetime_input {
      min-width: 150px;

      @media ${mobile} {
        width: 165px;
      }
    }

    .virtual-data-room_file-lifetime_combo-box {
      margin-inline-end: 16px;
      width: 92px;
      min-width: 92px;

      @media ${mobile} {
        margin-inline-end: 0px;
        width: 165px;
      }
    }
  }
`;

const FileLifetime = ({ t, roomParams, setRoomParams }) => {
  const lifetime = roomParams.lifetime ?? {
    value: 12,
    deletePermanently: false,
    period: 0,
  };

  const dateOptions = [
    {
      key: 1,
      label: capitalize(t("Common:Days")),
      value: 0,
      dataTestId: "virtual_data_room_file_lifetime_period_days",
    },
    {
      key: 2,
      label: t("Common:Months"),
      value: 1,
      dataTestId: "virtual_data_room_file_lifetime_period_months",
    },
    {
      key: 3,
      label: t("Common:Years"),
      value: 2,
      dataTestId: "virtual_data_room_file_lifetime_period_years",
    },
  ];

  const deleteOptions = [
    {
      key: 1,
      label: t("Common:MoveToSection", {
        sectionName: t("Common:TrashSection"),
      }),
      value: false,
      dataTestId: "virtual_data_room_file_lifetime_delete_move_to_trash",
    },
    {
      key: 2,
      label: t("Common:DeletePermanently"),
      value: true,
      dataTestId: "virtual_data_room_file_lifetime_delete_permanently",
    },
  ];

  const selectedInputValue = `${lifetime.value}`;
  const selectedDateOption = dateOptions.find(
    (o) => o.value === lifetime.period,
  );
  const selectedDeleteOptions = lifetime.deletePermanently
    ? deleteOptions[1]
    : deleteOptions[0];

  const [inputValue, setInputValue] = useState(selectedInputValue);
  const [selectedDate, setSelectedDate] = useState(selectedDateOption);
  const [selectedDelete, setSelectedDelete] = useState(selectedDeleteOptions);

  useEffect(() => {
    if (!roomParams.lifetime) {
      setRoomParams({
        ...roomParams,
        lifetime,
      });
    }
  }, [roomParams.lifetime]);

  const onChange = (e) => {
    if (e.target.value && !/^(?:[1-9][0-9]*)$/.test(e.target.value)) return;

    setInputValue(e.target.value);

    if (!e.target.value) return;

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
            isAutoFocussed={!roomParams.lifetime}
            isDisabled={isLoading}
            tabIndex={1}
            value={inputValue}
            onChange={onChange}
            scale
            maxLength={3}
            testId="virtual_data_room_file_lifetime_input"
          />
          <ComboBox
            className="virtual-data-room_file-lifetime_combo-box"
            options={dateOptions}
            isDisabled={isLoading}
            showDisabledItems
            selectedOption={selectedDate}
            scaledOptions
            onSelect={onSelectDate}
            directionY="bottom"
            dataTestId="virtual_data_room_file_lifetime_period_combobox"
          />
        </div>
        <ComboBox
          options={deleteOptions}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={selectedDelete}
          scale
          onSelect={onSelectDelete}
          directionY="bottom"
          dataTestId="virtual_data_room_file_lifetime_delete_combobox"
        />
      </div>
    </StyledFileLifetime>
  );
};

export default FileLifetime;
