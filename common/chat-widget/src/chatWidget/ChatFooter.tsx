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

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { FileType } from "../types/chatWidget";
import { DropDown } from "../components/dropdown";
import { getCurrentWordAtCursor } from "./utils";

const MAX_DROPDOWN_HEIGHT = 200;
const TEXTAREA_MAX_HEIGHT = 200;
const DROPDOWN_ITEM_HEIGHT = 50;
const DROPDOWN_INPUT_MIN_HEIGHT = 62;

const ChatFooter = ({
  addMessage,
  sendMessage,
  filesList = [],
  sendIconImage,
  placeholderText,
  placeholderSending,
  sendingMessage,
}: {
  addMessage: Function;
  sendMessage: Function;
  filesList?: FileType[];
  sendIconImage?: string;
  placeholderText?: string;
  placeholderSending?: string;
  sendingMessage?: boolean;
}) => {
  const chatPlaceholder = placeholderText ?? "Message AI...";
  const chatPlaceholderSending = placeholderSending ?? "Thinking...";
  const inputBlockRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [windowPosition, setWindowPosition] = useState({ left: "0", top: "0" });
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);

  const [sortedFiles, setSortedFiles] = useState<FileType[]>(filesList);

  const itemsHeight = sortedFiles.length * DROPDOWN_ITEM_HEIGHT;
  const dropdownHeight =
    itemsHeight < MAX_DROPDOWN_HEIGHT ? itemsHeight + 16 : 216; // 16 padding 8up + 8down

  const onSendMessage = () => {
    if (sendingMessage) return;
    if (message && message.trim() !== "") {
      addMessage({ message, isSend: true });
      setMessage("");
      sendMessage(message);
    }
  };

  const onKeyDownAction = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !isOpen) {
      onSendMessage();
      e.preventDefault();
    }
  };

  const onInput = (elem: React.ChangeEvent<HTMLTextAreaElement>) => {
    elem.currentTarget.style.height = `${DROPDOWN_INPUT_MIN_HEIGHT}px`;
    const textAreaScrollHeight = elem.currentTarget.scrollHeight;
    const isOverflowY = textAreaScrollHeight > TEXTAREA_MAX_HEIGHT;

    const height = isOverflowY ? TEXTAREA_MAX_HEIGHT : textAreaScrollHeight;

    elem.currentTarget.style.height = `${height}px`;
    if (isOverflowY) elem.currentTarget.style.overflowY = "scroll";
    else elem.currentTarget.style.overflowY = "hidden";
  };

  const setDropdownPosition = useCallback(() => {
    if (!inputBlockRef.current) return;
    const offsetTop = inputBlockRef.current.offsetTop;
    const offsetLeft = inputBlockRef.current.offsetLeft;
    const offsetWidth = inputBlockRef.current.offsetWidth;

    setWindowPosition({
      top: offsetTop - dropdownHeight + "px",
      left: offsetLeft + "px",
    });
    setDropdownWidth(offsetWidth);
  }, [dropdownHeight]);

  const onFocus = () => {
    if (checkAtSymbol(message) && filesList.length && !selectedFile) {
      setDropdownPosition();
      setIsOpen(true);
    }
  };

  const checkAtSymbol = (str: string) => {
    const regex = /(?:^|\s)@(?:|[a-zA-Z0-9]*$)/g;

    return str.search(regex) > -1;
  };

  const onChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const msg = e.target.value;

    const { currentWord } = getCurrentWordAtCursor(textAreaRef.current!);

    setMessage(msg);

    if (checkAtSymbol(currentWord) && filesList.length) {
      const newFiles = filesList.filter((f) =>
        f.title.startsWith(currentWord.substring(1))
      );

      if (newFiles.length) {
        setSortedFiles(newFiles);
        setDropdownPosition();
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
      setSelectedFile(null);
    }
  };

  const onCloseDropDown = () => {
    setIsOpen(false);
    setWindowPosition({ top: "0px", left: "0px" });
  };

  const onSelectItem = (file: FileType) => {
    const { startPos, endPos } = getCurrentWordAtCursor(textAreaRef.current!);

    setSelectedFile(file);

    if (file.isFolder) {
      setMessage(
        (prev) =>
          prev.substring(0, startPos) +
          `@folder-${file.id} ` +
          prev.substring(endPos)
      );
    } else {
      setMessage(
        (prev) =>
          prev.substring(0, startPos) + `@${file.id} ` + prev.substring(endPos)
      );
    }

    onCloseDropDown();
  };

  useEffect(() => {
    if (!sortedFiles.length) onCloseDropDown();
    setDropdownPosition();
  }, [sortedFiles.length, setDropdownPosition]);

  useEffect(() => {
    if (isOpen) setSortedFiles(filesList);
  }, [filesList, isOpen]);

  return (
    <div className="chat-panel-footer-container">
      <div ref={inputBlockRef} className="chat-panel-footer_input-block">
        <textarea
          ref={textAreaRef}
          className="chat-panel-footer_input"
          value={message}
          onChange={onChangeMessage}
          placeholder={
            sendingMessage ? chatPlaceholderSending : chatPlaceholder
          }
          onFocus={onFocus}
          onKeyDown={onKeyDownAction}
          onInput={onInput}
          disabled={sendingMessage}
        />

        <div className="chat-panel-footer_input-append">
          <div
            className="chat-panel-footer_input-block-icon"
            onClick={onSendMessage}
          >
            <div className="chat-panel-footer_icon-wrapper">
              {sendIconImage ? (
                <img src={sendIconImage} alt="send icon" />
              ) : (
                <Send color="#A3A9AE" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isOpen ? (
        <>
          <div
            className="chat-panel-footer_input-dropdown"
            style={{ ...windowPosition, height: dropdownHeight }}
          >
            <DropDown
              maxHeight={MAX_DROPDOWN_HEIGHT}
              itemHeight={DROPDOWN_ITEM_HEIGHT}
              dropdownWidth={dropdownWidth}
            >
              {sortedFiles.map((file) => {
                return (
                  <div
                    onClick={() => onSelectItem(file)}
                    className="chat-panel-footer_input-dropdown-item"
                    key={file.id}
                  >
                    {/* <p>{file.id}</p> */}
                    <p>{file.title}</p>
                  </div>
                );
              })}
            </DropDown>
          </div>
          <div
            onClick={onCloseDropDown}
            className="chat-panel-footer_input-backdrop"
          ></div>
        </>
      ) : null}
    </div>
  );
};

export default ChatFooter;
