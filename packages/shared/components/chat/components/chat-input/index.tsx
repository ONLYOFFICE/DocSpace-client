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

import React, { useMemo } from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import SelectReactSvgUrl from "PUBLIC_DIR/images/select.react.svg?url";
import SendReactSvgUrl from "PUBLIC_DIR/images/icons/12/arrow.up.react.svg?url";

import { Textarea } from "../../../textarea";
import { IconButton } from "../../../icon-button";
import { DropDown } from "../../../drop-down";
import { DropDownItem } from "../../../drop-down-item";
import { Text } from "../../../text";
import { TSelectorItem } from "../../../selector";

import { useFilesStore } from "../../store/filesStore";
import { useMessageStore } from "../../store/messageStore";

import FilePreview from "../file-preview";

import FilesSelector from "./components/FileSelector";

import styles from "./ChatInput.module.scss";
import { ChatInputProps } from "./ChatInput.types";

const ChatInput = ({
  currentDeviceType,
  displayFileExtension,
  vectorizedFiles,

  getIcon,
}: ChatInputProps) => {
  const { t } = useTranslation(["Common"]);

  const {
    sendMessage,
    cancelBuild,
    isInit,
    isRequestRunning,
    isEmptyMessages,
    currentSession,
  } = useMessageStore();
  const { files, wrapperHeight, clearFiles, addFile } = useFilesStore();

  const [value, setValue] = React.useState("");
  const [fileValue, setFileValue] = React.useState("");
  const [showSelector, setShowSelector] = React.useState(false);
  const [showDropDown, setShowDropDown] = React.useState(false);
  const [startPosition, setStartPosition] = React.useState(-1);

  const prevSession = React.useRef(currentSession);
  const inputRef = React.useRef<HTMLDivElement>(null);

  const isSendDisabled = !isInit ? false : value ? isRequestRunning : false;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSendDisabled) return;

    const val = e.target.value;

    if (val === "\n") {
      setShowDropDown(false);
      setStartPosition(-1);
      return;
    }

    const lastSymbol = val[val.length - 1];

    if (lastSymbol === "@") {
      setShowDropDown(true);
      setStartPosition(val.length - 1);
      setFileValue("");
    }
    if (lastSymbol === " " || !val) {
      setShowDropDown(false);
      setFileValue("");
      setStartPosition(-1);
    }

    if (showDropDown) {
      // Include all characters after '@' including the last one
      setFileValue(val.substring(startPosition + 1));
    }

    setValue(val);
  };

  const toggleSelector = () => {
    setShowSelector((prev) => !prev);
  };

  const sendMessageAction = React.useCallback(() => {
    if (isRequestRunning || !value || showSelector) return;

    sendMessage(value, files, () => {
      setValue("");
      clearFiles();
    });
  }, [isRequestRunning, value, showSelector, files, sendMessage, clearFiles]);

  const onKeyEnter = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) return sendMessageAction();
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

  React.useEffect(() => {
    if (currentSession.includes(prevSession.current)) return;

    prevSession.current = currentSession;
    setValue("");
    clearFiles();
  }, [currentSession, clearFiles]);

  const withFile = files.length !== 0;

  const placeholder = isEmptyMessages
    ? t("Common:AIChatInputFirstMessage")
    : t("Common:AIChatInputAskAI");

  const isDisabled = !isInit ? !value : isRequestRunning ? false : !value;

  const sendIconProps = !isInit
    ? { onClick: sendMessageAction, isDisabled, iconNode: null }
    : {
        onClick: isRequestRunning ? cancelBuild : sendMessageAction,
        isDisabled,
        iconNode: isRequestRunning ? (
          <div className={styles.whiteSquare} />
        ) : null,
      };

  const dropDownItems = useMemo(() => {
    const items = vectorizedFiles
      .filter((file) => !files.find((f) => f.id === file.id))
      .filter((file) => {
        if (fileValue) {
          return file.title.toLowerCase().includes(fileValue.toLowerCase());
        }

        return true;
      })
      .map((item) => (
        <DropDownItem
          key={item.id}
          onClick={() => {
            const selectorItem: TSelectorItem = {
              label: item.title,
              fileExst: item.fileExst,
              id: item.id,
              icon: "",
              parentId: item.folderId,
              rootFolderType: item.rootFolderType,
              security: item.security,
              fileType: item.fileType,
            };

            // Remove the '@' and any text after it from the input value
            setValue((prev) => prev.substring(0, startPosition));

            setFileValue("");
            setShowDropDown(false);
            setStartPosition(-1);

            addFile(selectorItem);
          }}
        >
          <img src={getIcon(24, item.fileExst)} alt={item.title} />
          <Text truncate> {item.title}</Text>
        </DropDownItem>
      ));

    return items;
  }, [vectorizedFiles, getIcon, files, fileValue, addFile, startPosition]);

  const style = useMemo(() => {
    if (!inputRef.current || !showDropDown) return;

    const rects = inputRef.current.getBoundingClientRect();

    const width =
      currentDeviceType === "desktop" ? rects.width - 40 : rects.width - 32;

    return {
      width: `${width}px`,
      bottom: `${window.innerHeight - rects.bottom + rects.height + 4}px`,
    };
  }, [showDropDown, currentDeviceType]);

  return (
    <div
      className={classNames(styles.chatInput)}
      style={
        {
          "--chat-input-textarea-wrapper-with-files-padding": `${wrapperHeight + 24}px 8px 44px`,
          "--chat-input-textarea-wrapper-with-files-height": `${116 + wrapperHeight + 24}px`,
          "--chat-input-textarea-wrapper-with-files-max-height": `${172 + wrapperHeight + 24}px`,
        } as React.CSSProperties
      }
      ref={inputRef}
    >
      <Textarea
        onChange={handleChange}
        value={value}
        isFullHeight
        className={styles.chatInputTextArea}
        wrapperClassName={classNames({
          [styles.chatInputTextAreaWrapperWithFiles]: withFile,
          [styles.chatInputTextAreaWrapper]: !withFile,
        })}
        placeholder={placeholder}
        isChatMode
      />
      <FilePreview
        getIcon={getIcon}
        displayFileExtension={displayFileExtension}
        withRemoveFile
        files={files}
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
          size={12}
          isClickable
          className={classNames(
            styles.chatInputButtonsFile,
            styles.chatInputButtonsSend,
            {
              [styles.disabled]: isDisabled,
            },
          )}
          {...sendIconProps}
        />
      </div>
      {showSelector ? (
        <FilesSelector
          showSelector={showSelector}
          toggleSelector={toggleSelector}
          getIcon={getIcon}
          currentDeviceType={currentDeviceType}
          includedItems={vectorizedFiles.map((v) => v.id)}
        />
      ) : null}
      {showDropDown ? (
        <DropDown
          open={showDropDown}
          directionY="top"
          forwardedRef={inputRef}
          clickOutsideAction={() => setShowDropDown(false)}
          style={style}
          offsetLeft={currentDeviceType === "desktop" ? 20 : 16}
          isNoFixedHeightOptions
          maxHeight={dropDownItems.length > 7 ? 300 : undefined}
          className={styles.selectFileDropDown}
        >
          {dropDownItems.length ? (
            dropDownItems
          ) : (
            <DropDownItem noActive noHover>
              No results
            </DropDownItem>
          )}
        </DropDown>
      ) : null}
    </div>
  );
};

export default observer(ChatInput);
