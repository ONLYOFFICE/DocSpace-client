// (c) Copyright Ascensio System SIA 2009-2025
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

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { TabItem } from "@docspace/shared/components/tab-item";
import { WatermarkAdditions } from "@docspace/shared/enums";

import { StyledWatermark } from "./StyledComponent";

const tabsOptions = (t) => [
  {
    id: "UserName",
    name: t("UserName"),
    index: 0,
  },
  {
    id: "UserEmail",
    name: t("UserEmail"),
    index: 1,
  },
  {
    id: "UserIpAdress",
    name: t("UserIPAddress"),
    index: 2,
  },
  {
    id: "CurrentDate",
    name: t("Common:CurrentDate"),
    index: 3,
  },
  {
    id: "RoomName",
    name: t("Common:RoomName"),
    index: 4,
  },
];

const getInitialState = (initialTab) => {
  const state = {
    UserName: false,
    UserEmail: false,
    UserIpAdress: false,
    CurrentDate: false,
    RoomName: false,
  };

  initialTab.forEach((item) => {
    state[item.id] = true;
  });

  return state;
};

const getInitialText = (text, isEdit) => {
  return isEdit && text ? text : "";
};

const getTabsInfo = (additions, t, tabs) => {
  const dataTabs = tabs ?? tabsOptions(t);

  return dataTabs.filter((item) => additions & WatermarkAdditions[item.id]);
};

const getInitialTabs = (additions, isEdit, t) => {
  const dataTabs = tabsOptions(t);

  if (!isEdit || !additions) return [dataTabs[0]];

  return getTabsInfo(additions, t, dataTabs);
};

const rotateOptions = (t) => [
  {
    key: -45,
    label: t("Diagonal"),
    dataTestId: "virtual_data_room_watermark_position_diagonal",
  },
  {
    key: 0,
    label: t("Horizontal"),
    dataTestId: "virtual_data_room_watermark_position_horizontal",
  },
];

const getInitialRotate = (rotate, isEdit, isImage, t) => {
  const dataRotate = rotateOptions(t);

  if (!isEdit || (isEdit && isImage)) return dataRotate[0];

  const item = dataRotate.find((elm) => {
    return elm.key === rotate;
  });

  return !item ? dataRotate[0] : item;
};

const ViewerInfoWatermark = ({
  isEdit,

  setRoomParams,
  roomParams,
  isImage,
  initialSettings,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const elements = useRef(null);
  const initialInfo = useRef(null);
  let watermark = roomParams.watermark;

  if (initialInfo.current === null) {
    initialInfo.current = {
      dataRotate: rotateOptions(t),
      dataTabs: tabsOptions(t),
      tabs: getInitialTabs(initialSettings?.additions, isEdit, t),
      rotate: getInitialRotate(initialSettings?.rotate, isEdit, isImage, t),
      text: getInitialText(initialSettings?.text, isEdit),
    };

    elements.current = getInitialState(initialInfo.current.tabs);

    if (!isImage && initialSettings) watermark = initialSettings;
    else
      watermark = {
        rotate: initialInfo.current.rotate.key,
        additions:
          roomParams.watermark?.additions || WatermarkAdditions.UserName,
        // image: "",
        imageWidth: 0,
        imageHeight: 0,
        imageScale: 0,
        ...(initialInfo.current.text && {
          text: initialInfo.current.text,
        }),
      };
  }

  const initialInfoRef = initialInfo.current;
  const [selectedPosition, setSelectedPosition] = useState(
    initialInfoRef.rotate,
  );
  const [textValue, setTextValue] = useState(initialInfoRef.text);

  useEffect(() => {
    setRoomParams({
      ...roomParams,
      watermark,
    });
  }, []);

  const onSelect = (e) => {
    const itemKey = e.currentTarget.dataset.key;
    const elementsData = elements.current;
    elementsData[itemKey] = !elementsData[itemKey];

    let flagsCount = 0;

    Object.keys(elementsData).forEach((k) => {
      const value = elementsData[k];

      if (value) {
        flagsCount += WatermarkAdditions[k];
      }
    });

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, additions: flagsCount },
    });

    const tabs = getTabsInfo(flagsCount, t);
    elements.current = getInitialState(tabs);
  };

  const onPositionChange = (item) => {
    setSelectedPosition(item);

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, rotate: item.key },
    });
  };

  const onTextChange = (e) => {
    const { value } = e.target;
    setTextValue(value);

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, text: value },
    });
  };

  return (
    <StyledWatermark>
      <Text className="watermark-title" fontWeight={600} lineHeight="20px">
        {t("AddWatermarkElements")}
      </Text>

      <div className="watermark-tab_items">
        {initialInfoRef.dataTabs.map((item) => {
          const isActive =
            initialInfoRef.tabs.findIndex((i) => i.index === item.index) > -1;

          return (
            <TabItem
              key={item.id}
              data-key={item.id}
              label={item.name}
              isActive={isActive}
              isDisabled={isActive}
              onSelect={onSelect}
              withMultiSelect
              dataTestId={`virtual_data_room_watermark_tab_${item.id.toLowerCase()}`}
            />
          );
        })}
      </div>

      <Text
        className="watermark-title title-without-top"
        fontWeight={600}
        lineHeight="20px"
      >
        {t("AddStaticText")}
      </Text>
      <TextInput
        scale
        value={textValue}
        tabIndex={1}
        onChange={onTextChange}
        testId="virtual_data_room_watermark_text_input"
      />

      <Text className="watermark-title" fontWeight={600} lineHeight="20px">
        {t("Position")}
      </Text>
      <ComboBox
        selectedOption={selectedPosition}
        options={initialInfoRef.dataRotate}
        onSelect={onPositionChange}
        scaled
        scaledOptions
        dataTestId="virtual_data_room_watermark_position_combobox"
      />
    </StyledWatermark>
  );
};

export default ViewerInfoWatermark;
