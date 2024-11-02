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

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { ComboBox } from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { FileInput } from "@docspace/shared/components/file-input";
import { imageProcessing } from "@docspace/shared/utils/common";
import { ButtonDelete } from "@docspace/shared/components/image-editor";
import { HelpButton } from "@docspace/shared/components/help-button";

import { StyledWatermark } from "./StyledComponent";

const scaleOptions = [
  { key: 100, label: "100" },
  { key: 200, label: "200" },
  { key: 300, label: "300" },
  { key: 400, label: "400" },
  { key: 500, label: "500" },
];

const rotateOptions = [
  { key: 0, label: "0" },
  { key: 30, label: "30" },
  { key: 45, label: "45" },
  { key: 60, label: "60" },
  { key: 90, label: "90" },
];
const getInitialScale = (scale, isEdit) => {
  if (!isEdit || !scale) return scaleOptions[0];

  return scaleOptions.find((item) => {
    return item.key === scale;
  });
};

const getInitialRotate = (rotate, isEdit) => {
  if (!isEdit) return rotateOptions[0];

  const item = rotateOptions.find((item) => {
    return item.key === rotate;
  });

  return !item ? rotateOptions[0] : item;
};

const ImageWatermark = ({
  isEdit,
  roomParams,
  setRoomParams,
  isImage,

  initialSettings,
}) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common"]);

  const initialInfo = useRef(null);
  const imageUrl = initialSettings?.imageUrl;
  const image = roomParams.watermark?.image;

  if (initialInfo.current === null) {
    initialInfo.current = {
      rotate: getInitialRotate(initialSettings?.rotate, isEdit),
      scale: getInitialScale(initialSettings?.imageScale, isEdit),
    };
  }

  const initialInfoRef = initialInfo.current;

  const [selectedRotate, setRotate] = useState(initialInfoRef.rotate);
  const [selectedScale, setScale] = useState(initialInfoRef.scale);
  const [selectedImageUrl, setImageUrl] = useState(imageUrl);

  const previewRef = useRef(null);

  const watermark =
    isImage && initialSettings
      ? initialSettings
      : {
          rotate: selectedRotate.key,
          imageScale: selectedScale.key,
          additions: 0,
          ...(selectedImageUrl && { imageUrl: selectedImageUrl }),
          ...(image && { image }),
        };

  useEffect(() => {
    setRoomParams({
      ...roomParams,
      watermark,
    });

    return () => {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    };
  }, []);

  const onInput = (file) => {
    imageProcessing(file)
      .then((f) => {
        if (f instanceof File) {
          setRoomParams({
            ...roomParams,
            watermark: { ...watermark, image: f },
          });

          const img = new Image();

          previewRef.current = URL.createObjectURL(f);
          img.src = previewRef.current;

          img.onload = () => {
            setImageUrl(previewRef.current);
          };
        }
      })
      .catch((error) => {
        if (
          error instanceof Error &&
          error.message === "recursion depth exceeded"
        ) {
          toastr.error(t("Common:SizeImageLarge"));
        }
      });
  };

  const onScaleChange = (item) => {
    setScale(item);

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, imageScale: item.key },
    });
  };

  const onRotateChange = (item) => {
    setRotate(item);
    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, rotate: item.key },
    });
  };

  const onButtonClick = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    setRoomParams({
      ...roomParams,
      watermark: { ...watermark, image: null, imageUrl: null },
    });

    setImageUrl("");
  };

  const rotateItems = () => {
    const items = rotateOptions.map((item) => {
      return (
        <DropDownItem
          className="access-right-item"
          key={item.key}
          data-key={item.key}
          onClick={() => onRotateChange(item)}
        >
          {item.label}&deg;
        </DropDownItem>
      );
    });

    return <div style={{ display: "contents" }}>{items}</div>;
  };

  const scaleItems = () => {
    const items = scaleOptions.map((item) => {
      return (
        <DropDownItem
          className="access-right-item"
          key={item.key}
          data-key={item.key}
          onClick={() => onScaleChange(item)}
        >
          {item.label}&#37;
        </DropDownItem>
      );
    });

    return <div style={{ display: "contents" }}>{items}</div>;
  };

  // const onSelectFile = (fileInfo) => {
  //   setWatermarks({ image: fileInfo });
  // };

  return (
    <StyledWatermark
      rotate={selectedRotate.key}
      scale={selectedScale.key / 100}
      mainHeight={50}
    >
      {!selectedImageUrl && (
        <FileInput
          accept={["image/png", "image/jpeg"]}
          onInput={onInput}
          scale
        />
      )}

      {/* <FilesSelectorInput
        onSelectFile={onSelectFile}
        filterParam={FilesSelectorFilterTypes.IMG}
        isSelect
        scale
      /> */}

      {selectedImageUrl && (
        <div className="image-wrapper">
          <div>
            <div className="image-description">
              <Text fontWeight={600} className="image-watermark_text">
                {t("WatermarkPreview")}
              </Text>
              <HelpButton
                tooltipContent={
                  <Text fontSize="12px">{t("WatermarkPreviewHelp")}</Text>
                }
                offsetRight={0}
                className="settings_unavailable"
              />
            </div>
            <div className="image-watermark_wrapper">
              <img
                alt="logo"
                src={selectedImageUrl}
                className="header-logo-icon"
              />
            </div>
            <ButtonDelete t={t} onClick={onButtonClick} />
          </div>

          <div className="options-wrapper">
            <div>
              <Text fontWeight={600} lineHeight="20px">
                {t("Scale")}
              </Text>
              <ComboBox
                onSelect={onScaleChange}
                scaled
                scaledOptions
                advancedOptions={scaleItems()}
                options={[]}
                selectedOption={{}}
              >
                <div className="options">{selectedScale.label}&#37;</div>
              </ComboBox>
            </div>
            <div>
              <Text fontWeight={600} lineHeight="20px">
                {t("Rotate")}
              </Text>

              <ComboBox
                onSelect={onRotateChange}
                scaled
                scaledOptions
                advancedOptions={rotateItems()}
                options={[]}
                selectedOption={{}}
                advancedOptionsCount={rotateOptions.length}
                fillIcon={false}
              >
                <div className="options">{selectedRotate.label}&deg;</div>
              </ComboBox>
            </div>
          </div>
        </div>
      )}
    </StyledWatermark>
  );
};

export default ImageWatermark;
