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
import classNames from "classnames";
import { observer } from "mobx-react";

import SelectReactSvgUrl from "PUBLIC_DIR/images/select.react.svg?url";
import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";

import { DeviceType } from "../../../../enums";

import { Textarea } from "../../../textarea";
import { IconButton } from "../../../icon-button";

import { useFilesStore } from "../../store/filesStore";
import { useMessageStore } from "../../store/messageStore";
import { useCurrentFlowStore } from "../../store/currentFlowStore";

import FilesSelector from "./components/FileSelector";
import FilePreview from "./components/FilePreview";

import styles from "./ChatInput.module.scss";

const ChatInput = ({
  currentDeviceType,
  displayFileExtension,
  getIcon,
}: {
  currentDeviceType: DeviceType;
  displayFileExtension: boolean;
  getIcon: (size: number, fileExst: string) => string;
}) => {
  const { file } = useFilesStore();
  const { flow } = useCurrentFlowStore();

  const { sendMessage, isRequestRunning } = useMessageStore();

  const [value, setValue] = React.useState("");
  const [showSelector, setShowSelector] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const toggleSelector = () => {
    setShowSelector((prev) => !prev);
  };

  const sendMessageAction = React.useCallback(() => {
    if (isRequestRunning || !value || showSelector) return;

    setValue("");

    sendMessage(value, flow!);
  }, [isRequestRunning, sendMessage, value, flow, showSelector]);

  const onKeyEnter = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") return sendMessageAction();
      if (e.key === "Escape") return setShowSelector(false);
    },
    [sendMessageAction],
  );

  React.useEffect(() => {
    window.addEventListener("keydown", onKeyEnter);

    return () => {
      window.removeEventListener("keydown", onKeyEnter);
    };
  }, [onKeyEnter]);

  const withFile = file !== undefined;

  return (
    <div className={classNames(styles.chatInput)}>
      <Textarea
        onChange={handleChange}
        value={value}
        isFullHeight
        className={styles.chatInputTextArea}
        wrapperClassName={classNames({
          [styles.chatInputTextAreaWrapperWithFiles]: withFile,
          [styles.chatInputTextAreaWrapper]: !withFile,
        })}
        placeholder="Send a message..."
        isChatMode
      />
      <FilePreview
        getIcon={getIcon}
        displayFileExtension={displayFileExtension}
      />
      <div className={styles.chatInputButtons}>
        <IconButton
          iconName={SelectReactSvgUrl}
          size={16}
          isClickable
          onClick={toggleSelector}
          className={styles.chatInputButtonsFile}
        />

        <IconButton
          iconName={SendReactSvgUrl}
          size={16}
          isClickable
          onClick={sendMessageAction}
          className={classNames(
            styles.chatInputButtonsFile,
            styles.chatInputButtonsSend,
            { [styles.disabled]: !value || isRequestRunning },
          )}
          isDisabled={!value || isRequestRunning}
        />
      </div>
      {showSelector ? (
        <FilesSelector
          showSelector={showSelector}
          toggleSelector={toggleSelector}
          currentDeviceType={currentDeviceType}
        />
      ) : null}
    </div>
  );
};

export default observer(ChatInput);
