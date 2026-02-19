// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useState, useEffect, ChangeEvent } from "react";
import { capitalize } from "lodash";
import { Text } from "@docspace/ui-kit/components/text";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { ComboBox, TOption } from "@docspace/ui-kit/components/combobox";
import { TTranslation } from "@docspace/shared/types";
import { TRoomParams } from "@docspace/shared/utils/rooms";
import { TRoomLifetime } from "@docspace/shared/api/rooms/types";
import { InputType } from "@docspace/ui-kit/components/text-input";

import styles from "./FileLifetime.module.scss";

type DateOption = TOption & {
  value: number;
  dataTestId: string;
};

type DeleteOption = TOption & {
  value: boolean;
  dataTestId: string;
};

type FileLifetimeProps = {
  t: TTranslation;
  roomParams: TRoomParams;
  setRoomParams: (params: TRoomParams) => void;
};

const FileLifetime = ({ t, roomParams, setRoomParams }: FileLifetimeProps) => {
  const lifetime: TRoomLifetime = roomParams.lifetime ?? {
    value: 12,
    deletePermanently: false,
    period: 0,
  };

  const dateOptions: DateOption[] = [
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

  const deleteOptions: DeleteOption[] = [
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
  const [selectedDate, setSelectedDate] = useState<DateOption>(
    selectedDateOption ?? dateOptions[0],
  );
  const [selectedDelete, setSelectedDelete] = useState<DeleteOption>(
    selectedDeleteOptions,
  );

  useEffect(() => {
    if (!roomParams.lifetime) {
      setRoomParams({
        ...roomParams,
        lifetime,
      });
    }
  }, [roomParams.lifetime]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && !/^(?:[1-9][0-9]*)$/.test(e.target.value)) return;

    setInputValue(e.target.value);

    if (!e.target.value) return;

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, value: +e.target.value },
    });
  };

  const isLoading = false;

  const onSelectDate = (option: TOption) => {
    const dateOption = option as DateOption;
    setSelectedDate(dateOption);

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, period: dateOption.value },
    });
  };

  const onSelectDelete = (option: TOption) => {
    const deleteOption = option as DeleteOption;
    setSelectedDelete(deleteOption);

    setRoomParams({
      ...roomParams,
      lifetime: { ...lifetime, deletePermanently: deleteOption.value },
    });
  };

  return (
    <div className={styles.container}>
      <Text fontWeight={600} fontSize="13px">
        {t("FilesOlderThan")}
      </Text>

      <div className={styles.body}>
        <div className={styles.date}>
          <TextInput
            className={styles.input}
            type={InputType.text}
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
            className={styles.comboBox}
            options={dateOptions as TOption[]}
            isDisabled={isLoading}
            showDisabledItems
            selectedOption={selectedDate as TOption}
            scaledOptions
            onSelect={onSelectDate}
            directionY="bottom"
            dataTestId="virtual_data_room_file_lifetime_period_combobox"
          />
        </div>
        <ComboBox
          options={deleteOptions as TOption[]}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={selectedDelete as TOption}
          scaled
          onSelect={onSelectDelete}
          directionY="bottom"
          dataTestId="virtual_data_room_file_lifetime_delete_combobox"
        />
      </div>
    </div>
  );
};

export default FileLifetime;
