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

import React from "react";
import { useTranslation } from "react-i18next";
import resizeImage from "resize-image";
import equal from "fast-deep-equal/react";

import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { ONE_MEGABYTE } from "@docspace/shared/constants";

import styles from "../styles/AddEditDialog.module.scss";

export const useIcon = () => {
  const { t } = useTranslation(["AISettings", "OAuth"]);

  const [icon, setIcon] = React.useState("");
  const [error, setError] = React.useState("");

  const initFormData = React.useRef({ icon });

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";

      inputRef.current.files = null;
    }
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file =
      e.target.files && e.target.files?.length > 0 && e.target.files[0];

    if (file && file.type === "image/svg+xml") {
      if (file.size > ONE_MEGABYTE)
        return toastr.error(t("Common:SizeImageLarge"));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string")
          setIcon(reader.result);

        if (error) setError("");
      };
      reader.readAsDataURL(file);

      return;
    }

    if (file) {
      const widthProp = 64;
      const heightProp = 64;

      const img = new Image();
      img.onload = () => {
        const data = resizeImage.resize(img, widthProp, heightProp, "png");
        setIcon(data);

        if (error) setError("");
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const getIcon = () => {
    if (!icon) {
      setError(t("OAuth:ThisRequiredField"));
      return;
    }
    return icon;
  };

  const hasChanges = !equal(initFormData.current, { icon });

  const iconComponent = (
    <FieldContainer
      className={styles.iconContainer}
      labelText={t("AISettings:ServiceIcon")}
      isRequired
      isVertical
      labelVisible
      removeMargin
      errorMessage={error}
      hasError={!!error}
    >
      <div className={styles.iconBlock}>
        {icon ? <img className={styles.icon} alt="img" src={icon} /> : null}
        <SelectorAddButton
          label={t("OAuth:SelectNewImage")}
          onClick={onClick}
        />
      </div>
      <input
        ref={inputRef}
        id="customFileInput"
        className="custom-file-input"
        multiple
        type="file"
        onChange={onSelect}
        onClick={onInputClick}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/svg+xml"
      />
    </FieldContainer>
  );

  return {
    iconComponent,
    getIcon,
    iconChanged: hasChanges,
  };
};
