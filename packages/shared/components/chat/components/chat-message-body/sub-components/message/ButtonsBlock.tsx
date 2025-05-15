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

import { useState } from "react";
import copy from "copy-to-clipboard";
import { useTranslation } from "react-i18next";

import FileReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { IconButton } from "../../../../../icon-button";
import { toastr } from "../../../../../toast";

import { ChatMessageType } from "../../../../types/chat";

import styles from "../../ChatMessageBody.module.scss";

import FolderSelector, { type FolderSelectorProps } from "./FolderSelector";

type ButtonsBlockProps = Pick<ChatMessageType, "message"> &
  Pick<FolderSelectorProps, "getIcon" | "currentDeviceType">;

const ButtonsBlock = ({
  message,
  getIcon,
  currentDeviceType,
}: ButtonsBlockProps) => {
  const { t } = useTranslation(["Common"]);

  const [showSelector, setShowSelector] = useState(false);

  const onCopy = () => {
    if (typeof message === "string") {
      copy(message);

      toastr.success(t("Common:CopyMessageSuccess"));
    }
  };

  const onCreateFile = async () => {
    if (typeof message === "string") {
      setShowSelector(true);
      // const title = message.substring(0, 20);

      // try {
      //   await saveMessageToFile(message, title);

      //   toastr.success(
      //     <Trans
      //       i18nKey="SaveMessageSuccess"
      //       ns="Common"
      //       t={t}
      //       values={{ title }}
      //       components={{
      //         1: <Text fontSize="13px" fontWeight={600} />,
      //       }}
      //     />,
      //   );
      // } catch (error) {
      //   toastr.error(error as string);
      // }
    }
  };

  return (
    <div className={styles.buttonsBlock}>
      <IconButton
        iconName={CopyReactSvgUrl}
        size={16}
        isClickable
        onClick={onCopy}
        tooltipId="copyTooltip"
        tooltipContent={t("Common:CopyMessage")}
      />
      <IconButton
        iconName={FileReactSvgUrl}
        size={16}
        isClickable
        tooltipId="fileTooltip"
        tooltipContent={t("Common:SaveMessage")}
        onClick={onCreateFile}
      />
      {showSelector && typeof message === "string" ? (
        <FolderSelector
          showSelector={showSelector}
          toggleSelector={() => setShowSelector(false)}
          getIcon={getIcon}
          currentDeviceType={currentDeviceType}
          message={message}
        />
      ) : null}
    </div>
  );
};

export default ButtonsBlock;
