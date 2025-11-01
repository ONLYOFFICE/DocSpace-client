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

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";

import ViewerInfoWatermark from "./ViewerInfo";
import { StyledBody } from "./StyledComponent";
import ImageWatermark from "./ImageWatermark";

const imageWatermark = "image";
const viewerInfoWatermark = "viewerInfo";

const options = (t) => [
  {
    label: t("ViewerInfo"),
    value: viewerInfoWatermark,
    dataTestId: "virtual_data_room_watermarks_radio_viewer_info",
  },
  {
    label: t("Common:Image"),
    value: imageWatermark,
    dataTestId: "virtual_data_room_watermarks_radio_image",
  },
];

const getOptionType = (initialWatermarksSettings, isEdit) => {
  if (isEdit) {
    return initialWatermarksSettings?.additions === 0 &&
      initialWatermarksSettings?.imageUrl
      ? imageWatermark
      : viewerInfoWatermark;
  }

  return viewerInfoWatermark;
};
const Watermarks = ({
  isEdit,
  roomParams,
  setRoomParams,
  initialRoomParams,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);
  const [type, setType] = useState(
    getOptionType(initialRoomParams.watermark, isEdit),
  );

  const initialInfo = useRef(null);

  if (initialInfo.current === null) {
    initialInfo.current = {
      isImageType: type === imageWatermark,
    };
  }
  const initialInfoRef = initialInfo.current;

  const onSelectType = (e) => {
    const { value } = e.target;

    setType(value);
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
        dataTestId="virtual_data_room_watermarks_radio_group"
      />
      {type === imageWatermark ? (
        <ImageWatermark
          isEdit={isEdit}
          initialSettings={initialRoomParams.watermark}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          isImage={initialInfoRef.isImageType}
        />
      ) : (
        <ViewerInfoWatermark
          isEdit={isEdit}
          initialSettings={initialRoomParams.watermark}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          isImage={initialInfoRef.isImageType}
        />
      )}
    </StyledBody>
  );
};

export default Watermarks;
