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

import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Base } from "@docspace/shared/themes";

import FilesSelector from "SRC_DIR/components/FilesSelector";

const StyledFolderInput = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 0px;
  width: 100%;
  height: 32px;

  border-radius: 3px;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;

  .folder-path-wrapper {
    display: contents;
  }

  &,
  .icon-wrapper {
    border: 1px solid
      ${(props) =>
        props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
          .borderColor};
  }

  &:hover,
  &:hover > .icon-wrapper {
    border: 1px solid
      ${(props) =>
        props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
          .hoverBorderColor};
  }

  .root_label,
  .path,
  .room_title {
    padding: 5px 0px 5px 0px;
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: 20px;
  }

  .root_label {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 8px;`
        : `padding-left: 8px;`}
    /* background-color: ${(props) =>
      props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
        .background}; */
    color: ${(props) =>
      props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
        .rootLabelColor};
  }

  .path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .room_title {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-left: 8px;`
        : `padding-right: 8px;`}
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .icon-wrapper {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: auto;`
        : `margin-left: auto;`}
    background-color: ${(props) =>
      props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
        .background};
    height: 100%;
    box-sizing: border-box;
    width: 31px;
    min-width: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-top: none !important;
    border-bottom: none !important;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `border-left: none !important;`
        : `border-right: none !important;`}

    &:hover {
      path {
        fill: ${(props) =>
          props.theme.createEditRoomDialog.thirdpartyStorage.folderInput
            .iconFill};
      }
    }
  }
`;
StyledFolderInput.defaultProps = { theme: Base };

const FolderInput = ({
  t,
  roomTitle,
  thirdpartyAccount,
  onChangeStorageFolderId,
  isDisabled,
  createNewFolderIsChecked,
}) => {
  const [treeNode, setTreeNode] = useState(null);
  const [path, setPath] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onOpen = () => {
    if (isDisabled) return;
    setIsDialogOpen(true);
  };
  const onClose = () => {
    console.log("call close");
    setIsDialogOpen(false);
  };

  const getPathValue = () => {
    if (!treeNode) return;

    let path = treeNode.path;
    path = path.slice(1);

    let result = "";
    path.map(
      (node, i) => (result += node.title + (i !== path.length - 1 ? "/" : "")),
    );

    setPath(result);
  };

  useEffect(() => {
    if (!treeNode) return;
    onChangeStorageFolderId(treeNode.id);
    getPathValue();
  }, [treeNode]);

  console.log(thirdpartyAccount);

  if (!thirdpartyAccount.id) return null;

  let title = createNewFolderIsChecked || path ? "/" : t("RootFolderLabel");
  title += path;
  if (createNewFolderIsChecked) {
    title += path ? "/" : "";
    title += roomTitle || t("Files:NewRoom");
  }

  return (
    <>
      <StyledFolderInput noRoomTitle={!roomTitle} onClick={onOpen}>
        <div className="folder-path-wrapper" title={title}>
          <span className="root_label">
            {createNewFolderIsChecked || path ? "/" : t("RootFolderLabel")}
          </span>
          <span className="path">{path}</span>
          {createNewFolderIsChecked && (
            <span className="room_title">
              {(path ? "/" : "") + (roomTitle || t("Files:NewRoom"))}
            </span>
          )}
        </div>
        <div title={t("Common:SelectFolder")} className="icon-wrapper">
          <IconButton size={16} iconName={FolderReactSvgUrl} isClickable />
        </div>
      </StyledFolderInput>

      {isDialogOpen && (
        <FilesSelector
          isPanelVisible={isDialogOpen}
          onClose={onClose}
          isThirdParty
          isSelectFolder
          onSelectTreeNode={setTreeNode}
          passedFoldersTree={[thirdpartyAccount]}
          currentFolderId={treeNode ? treeNode.id : thirdpartyAccount.id}
        />
      )}
    </>
  );
};

export default FolderInput;
