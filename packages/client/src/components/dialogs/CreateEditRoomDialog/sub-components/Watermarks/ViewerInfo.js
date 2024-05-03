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

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { TabsContainer } from "@docspace/shared/components/tabs-container";
import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";

import { StyledWatermark } from "./StyledComponent";
import { WatermarkAdditions } from "@docspace/shared/enums";

const getInitialState = (initialTab) => {
  const state = {
    UserName: false,
    UserEmail: false,
    UserIpAdress: false,
    CurrentDate: false,
    RoomName: false,
  };

  initialTab.map((item) => {
    state[item.key] = true;
  });

  return state;
};

const ViewerInfoWatermark = ({
  setParams,
  initialPosition,
  dataPosition,
  dataTabs,
  initialTab,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);
  const elements = useRef(getInitialState(initialTab));

  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [textValue, setTextValue] = useState("");

  const onSelect = (item) => {
    let elementsData = elements.current;
    let flagsCount = 0;

    const key = item.key;

    elementsData[key] = !elementsData[item.key];

    for (const key in elementsData) {
      const value = elementsData[key];

      if (value) {
        flagsCount += WatermarkAdditions[key];
      }
    }

    setParams({ additions: flagsCount });
  };

  const onPositionChange = (item) => {
    setSelectedPosition(item);

    setParams({ rotate: item.key });
  };

  const onTextChange = (e) => {
    const { value } = e.target;
    setTextValue(value);

    setParams({ text: value });
  };

  return (
    <StyledWatermark>
      <Text className="watermark-title" fontWeight={600} lineHeight="20px">
        {t("AddWatermarkElements")}
      </Text>
      <TabsContainer
        elements={dataTabs}
        onSelect={onSelect}
        selectedItem={initialTab.map((item) => item.index)}
        multiple
        withBorder
      />
      <div>
        <Text className="watermark-title" fontWeight={600} lineHeight="20px">
          {t("AddStaticText")}
        </Text>
        <TextInput
          scale
          value={textValue}
          tabIndex={1}
          isAutoFocussed
          onChange={onTextChange}
        />
      </div>
      <Text className="watermark-title" fontWeight={600} lineHeight="20px">
        {t("Position")}
      </Text>
      <ComboBox
        selectedOption={selectedPosition}
        options={dataPosition}
        onSelect={onPositionChange}
        scaled
        scaledOptions
      />
    </StyledWatermark>
  );
};
export default ViewerInfoWatermark;
