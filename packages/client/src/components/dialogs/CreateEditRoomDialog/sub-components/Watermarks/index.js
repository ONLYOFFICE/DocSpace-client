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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";

import ViewerInfoWatermark from "./ViewerInfo";
import { StyledBody } from "./StyledComponent";

const textWatermark = "text",
  imageWatermark = "image",
  viewerInfoWatermark = "viewerInfo";

const options = (t) => [
  {
    label: t("ViewerInfo"),
    value: viewerInfoWatermark,
  },
  {
    label: t("Common:Image"),
    value: imageWatermark,
  },
];

const positionOptions = (t) => [
  { key: -45, label: t("Diagonal") },
  { key: 0, label: t("Horizontal") },
];
const Watermarks = ({ setRoomParams }) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);
  const [type, setType] = useState(viewerInfoWatermark);

  const dataPosition = positionOptions(t);
  const initialPosition = dataPosition[0];

  useEffect(() => {
    setRoomParams((prevState) => ({
      ...prevState,
      watermarks: {
        enabled: true,
        rotate: initialPosition.key,
        text: "",
        additions: 0,
      },
    }));
  }, []);

  const onSelectType = (e) => {
    const { value } = e.target;

    setType(value);
  };

  const setParams = (info) => {
 
    setRoomParams((prevState) => ({
      ...prevState,
      watermarks: { ...prevState.watermarks, ...info },
    }));
  };
  const typeOptions = options(t);

  return (
    <StyledBody>
      <RadioButtonGroup
        name="watermarks-radiobutton"
        fontSize="13px"
        fontWeight="400"
        spacing="8px"
        options={typeOptions}
        selected={type}
        onClick={onSelectType}
      />

      {type === viewerInfoWatermark && (
        <ViewerInfoWatermark
          setParams={setParams}
          initialPosition={initialPosition}
          dataPosition={dataPosition}
        />
      )}
    </StyledBody>
  );
};

export default Watermarks;
