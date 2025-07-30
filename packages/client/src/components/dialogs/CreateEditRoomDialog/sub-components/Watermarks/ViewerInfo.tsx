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
import { TFunction } from "i18next";

import { InputType, TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { ComboBox, TOption } from "@docspace/shared/components/combobox";
import { WatermarkAdditions } from "@docspace/shared/enums";
import { TabItem } from "@docspace/shared/components/tab-item";
import { TWatermark } from "@docspace/shared/api/rooms/types";
import { TRoomParams } from "@docspace/shared/utils/rooms";

import { StyledWatermark } from "./StyledComponent";

const tabsOptions = (t: TFunction) => [
  {
    id: "UserName",
    name: t("UserName"),
    index: 0,
    content: null,
  },
  {
    id: "UserEmail",
    name: t("UserEmail"),
    index: 1,
    content: null,
  },
  {
    id: "UserIpAdress",
    name: t("UserIPAddress"),
    index: 2,
    content: null,
  },
  {
    id: "CurrentDate",
    name: t("Common:CurrentDate"),
    index: 3,
    content: null,
  },
  {
    id: "RoomName",
    name: t("Common:RoomName"),
    index: 4,
    content: null,
  },
];

const getInitialState = (initialTab: { id: string }[]) => {
  const state = {
    UserName: false,
    UserEmail: false,
    UserIpAdress: false,
    CurrentDate: false,
    RoomName: false,
  };

  initialTab.forEach((item) => {
    state[item.id as keyof typeof state] = true;
  });

  return state;
};

const getInitialText = (text: string, isEdit: boolean) => {
  return isEdit && text ? text : "";
};

const getTabsInfo = (
  additions: number,
  t: TFunction,
  tabs?: { id: string; index: number }[],
) => {
  const dataTabs = tabs ?? tabsOptions(t);

  return dataTabs.filter(
    (item) =>
      additions &
      WatermarkAdditions[item.id as keyof typeof WatermarkAdditions],
  );
};

const getInitialTabs = (additions: number, isEdit: boolean, t: TFunction) => {
  const dataTabs = tabsOptions(t);

  if (!isEdit || !additions) return [dataTabs[0]];

  return getTabsInfo(additions, t, dataTabs);
};

const rotateOptions = (t: TFunction) => [
  { key: -45, label: t("Diagonal") },
  { key: 0, label: t("Horizontal") },
];

const getInitialRotate = (
  rotate: number,
  isEdit: boolean,
  isImage: boolean,
  t: TFunction,
) => {
  const dataRotate = rotateOptions(t);

  if (!isEdit || (isEdit && isImage)) return dataRotate[0];

  const item = dataRotate.find((elm) => {
    return elm.key === rotate;
  });

  return !item ? dataRotate[0] : item;
};

type ViewerInfoWatermarkProps = {
  isEdit: boolean;
  setRoomParams: (params: TRoomParams) => void;
  roomParams: TRoomParams;
  isImage: boolean;
  initialSettings: TWatermark;
};

const ViewerInfoWatermark = ({
  isEdit,

  setRoomParams,
  roomParams,
  isImage,
  initialSettings,
}: ViewerInfoWatermarkProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const elements = useRef<ReturnType<typeof getInitialState> | null>(null);
  const initialInfo = useRef<{
    dataRotate: { key: number; label: string }[];
    dataTabs: { id: string; name: string; index: number; content: null }[];
    tabs: { id: string; index: number }[];
    rotate: { key: number; label: string };
    text: string;
  } | null>(null);
  let watermark = roomParams.watermark;

  if (initialInfo.current === null) {
    initialInfo.current = {
      dataRotate: rotateOptions(t),
      dataTabs: tabsOptions(t),
      tabs: getInitialTabs(initialSettings?.additions, isEdit, t),
      rotate: getInitialRotate(initialSettings?.rotate, isEdit, isImage, t),
      text: getInitialText(initialSettings.text!, isEdit),
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

  const onSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const itemKey = e.currentTarget.dataset.key;
    const elementsData = elements.current;
    if (!itemKey || !elementsData) return;

    elementsData[itemKey as keyof typeof elementsData] =
      !elementsData[itemKey as keyof typeof elementsData];

    let flagsCount = 0;

    Object.keys(elementsData).forEach((k) => {
      const value = elementsData[k as keyof typeof elementsData];

      if (value) {
        flagsCount += WatermarkAdditions[k as keyof typeof WatermarkAdditions];
      }
    });

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark!, additions: flagsCount },
    });

    const tabs = getTabsInfo(flagsCount, t);
    elements.current = getInitialState(tabs);
  };

  const onPositionChange = (item: TOption) => {
    setSelectedPosition(item as { key: number; label: string });

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark!, rotate: item.key as number },
    });
  };

  const onTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTextValue(value);

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark!, text: value },
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
        type={InputType.text}
      />

      <Text className="watermark-title" fontWeight={600} lineHeight="20px">
        {t("Position")}
      </Text>
      <ComboBox
        selectedOption={selectedPosition}
        options={initialInfoRef?.dataRotate as TOption[]}
        onSelect={onPositionChange}
        scaled
        scaledOptions
      />
    </StyledWatermark>
  );
};

export default ViewerInfoWatermark;
