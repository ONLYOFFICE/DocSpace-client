// (c) Copyright Ascensio System SIA 2009-2024
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

import { withTranslation, useTranslation } from "react-i18next";
import { useState, ChangeEvent, MouseEvent } from "react";
import { isMobileOnly, isMobile } from "react-device-detect";
import styled from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

const StyledRoomTrash = styled.div`
  .room-trash_label {
    margin-bottom: 2px;
  }

  .room-trash_description {
    color: ${(props) => props.theme.text.disableColor};
    margin-bottom: 8px;
  }
`;

const OPTIONS = [
  { key: "0", days: "15" },
  { key: "1", days: "30" },
  { key: "2", days: "60" },
];

const RoomTrash = () => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const defaultSelectedItem = {
    key: OPTIONS[1].key,
    label: `${OPTIONS[1].days} ${t("Common:Days")}`,
  };

  const [selectedItem, setSelectedItem] = useState(defaultSelectedItem);

  const onSelect = (
    e: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLElement>,
  ) => {
    const selectItemId = e.currentTarget.id;
    const selectItem = OPTIONS?.find((item) => item.key === selectItemId);

    setSelectedItem({
      key: selectItem?.key ?? "",
      label: `${selectItem?.days} ${t("Common:Days")}`,
    });
  };

  const advancedOptions = (
    <>
      {OPTIONS?.map((item) => {
        return (
          <DropDownItem onClick={onSelect} key={item.key} id={item.key}>
            <Text className="drop-down-item_text" fontWeight={600}>
              {item.days} {t("Common:Days")}
            </Text>
          </DropDownItem>
        );
      })}
    </>
  );

  return (
    <StyledRoomTrash>
      <Text fontWeight={600} className="room-trash_label">
        {t("TrashRoomLabel")}
      </Text>
      <Text fontSize="12px" className="room-trash_description">
        {t("TrashRoomDescription")}
      </Text>

      <ComboBox
        className="room-trash-combobox"
        selectedOption={selectedItem}
        options={[]}
        advancedOptions={advancedOptions}
        scaled
        withBackdrop={isMobile}
        size="content"
        manualWidth="auto"
        isMobileView={isMobileOnly}
        directionY="both"
        displaySelectedOption
        noBorder={false}
        isDefaultMode
        hideMobileView={false}
        forceCloseClickOutside
        scaledOptions
        showDisabledItems
        displayArrow
      />
    </StyledRoomTrash>
  );
};

export default withTranslation(["Common", "CreateEditRoomDialog"])(RoomTrash);
