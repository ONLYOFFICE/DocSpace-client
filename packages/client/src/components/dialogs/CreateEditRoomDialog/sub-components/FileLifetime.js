/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect } from "react";
import capitalize from "lodash/capitalize";
import { Text } from "@docspace/ui-kit/components/text";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { ComboBox } from "@docspace/ui-kit/components/combobox";

import styles from "../CreateEditRoomDialog.module.scss";

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
    <div className={`${styles.fileLifetime} virtual-data-room_file-lifetime`}>
      <Text fontWeight={600} fontSize="13px">
        {t("FilesOlderThan")}
      </Text>

      <div className="virtual-data-room_file-lifetime_body">
        <div className="virtual-data-room_file-lifetime_date">
          <TextInput
            className="virtual-data-room_file-lifetime_input"
            name="file_lifetime_days"
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
            manualWidth="auto"
            style={{ minWidth: "200px" }}
            onSelect={onSelectDate}
            directionY="bottom"
            dataTestId="virtual_data_room_file_lifetime_period_combobox"
          />
        </div>
        <ComboBox
          className="virtual-data-room_file-lifetime_delete-combo-box"
          options={deleteOptions}
          isDisabled={isLoading}
          showDisabledItems
          selectedOption={selectedDelete}
          scale
          scaledOptions
          textOverflow
          onSelect={onSelectDelete}
          directionY="bottom"
          dataTestId="virtual_data_room_file_lifetime_delete_combobox"
        />
      </div>
    </div>
  );
};

export default FileLifetime;
