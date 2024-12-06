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

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";

import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import PasswordRow from "./PasswordRow";
import { StyledPasswordContent } from "./StyledDownloadDialog";

const PasswordContent = (props) => {
  const { setDownloadFilesPassword, passwordFiles, sortedDownloadFiles } =
    props;
  const { t } = useTranslation(["DownloadDialog", "Common"]);

  const [barIsVisible, setBarIsVisible] = useState(true);

  const onClose = () => {
    setBarIsVisible(false);
  };

  const { original, other, remove, password } = sortedDownloadFiles;

  const passwordRow = (items, text, type) => {
    return (
      <div className="password-row-wrapper">
        <div className="password-info-text">
          <Text fontWeight={600} fontSize="14px">
            {text}
          </Text>
        </div>
        <div>
          {items.map((item) => {
            return <PasswordRow item={item} type={type} />;
          })}
        </div>
      </div>
    );
  };
  return (
    <StyledPasswordContent>
      {barIsVisible && (
        <PublicRoomBar
          headerText={t("ProtectedFiles")}
          bodyText={t("EnteringPassword")}
          iconName={InfoSvgUrl}
          onClose={onClose}
        />
      )}
      {other?.length > 0 &&
        passwordRow(other, t("Common:PasswordRequired"), "other")}
      {original?.length > 0 &&
        passwordRow(original, t("InOriginalFormat"), "original")}
      {password?.length > 0 &&
        passwordRow(password, t("PasswordEntered"), "password")}
      {remove?.length > 0 &&
        passwordRow(remove, t("RemovedFromList"), "remove")}
    </StyledPasswordContent>
  );
};

export default inject(({ filesStore, dialogsStore }) => {
  const { passwordFiles } = filesStore;
  const { setDownloadFilesPassword, sortedDownloadFiles } = dialogsStore;
  console.log("sortedDownloadFiles", sortedDownloadFiles);
  return { passwordFiles, setDownloadFilesPassword, sortedDownloadFiles };
})(observer(PasswordContent));
