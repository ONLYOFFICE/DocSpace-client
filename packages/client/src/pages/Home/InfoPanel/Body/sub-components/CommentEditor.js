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

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import React, { useState, useEffect } from "react";
import { inject } from "mobx-react";
import { ReactSVG } from "react-svg";

import { toastr } from "@docspace/shared/components/toast";
import { Textarea } from "@docspace/shared/components/textarea";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";

import { MAX_FILE_COMMENT_LENGTH } from "@docspace/shared/constants";
// import infoPanel from "@docspace/shared/components/section/sub-components/info-panel";

const CommentEditor = ({
  t,
  item,
  editing,
  setInfoPanelSelection,
  fetchFileVersions,
  updateCommentVersion,

  setVerHistoryFileId,
  setVerHistoryFileSecurity,
}) => {
  const { id, comment, version, security } = item;

  const changeVersionHistoryAbility = !editing && security?.EditHistory;

  useEffect(() => {
    setVerHistoryFileId(id);
    setVerHistoryFileSecurity(security);
  }, []);

  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [inputValue, setInputValue] = useState(comment || "");

  const onChangeInputValue = (e) => {
    const value = e.target.value;
    if (value.length > MAX_FILE_COMMENT_LENGTH) return;

    setInputValue(value);
  };

  const onOpenEditor = async () => {
    setInputValue(comment);
    setIsEdit(true);
  };

  const onSave = async () => {
    setIsLoading(true);

    await fetchFileVersions(id, security).catch((err) => {
      toastr.error(err);
      setIsLoading(false);
    });

    updateCommentVersion(id, inputValue, version).catch((err) => {
      toastr.error(err);
      setIsLoading(false);
    });

    setInfoPanelSelection({ ...item, comment: inputValue });
    setIsEdit(false);
    setIsLoading(false);
  };

  const onCancel = () => {
    setIsEdit(false);
    setInputValue(comment);
  };

  return (
    <div className="property-comment_editor property-content">
      {!isEdit ? (
        <div className="property-comment_editor-display">
          {comment && (
            <Text truncate className="property-content">
              {comment}
            </Text>
          )}
          {changeVersionHistoryAbility && (
            <div className="edit_toggle" onClick={onOpenEditor}>
              <ReactSVG className="edit_toggle-icon" src={PencilReactSvgUrl} />
              <div className="property-content edit_toggle-text">
                {comment ? t("Common:EditButton") : t("Common:AddButton")}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="property-comment_editor-editor">
          <Textarea
            isDisabled={isLoading}
            value={inputValue}
            onChange={onChangeInputValue}
            autoFocus
            areaSelect
            heightTextArea="54px"
            fontSize={13}
          />
          <div className="property-comment_editor-editor-buttons">
            <Button
              isLoading={isLoading}
              label={t("Common:SaveButton")}
              onClick={onSave}
              size="extraSmall"
              primary
            />
            <Button
              label={t("Common:CancelButton")}
              onClick={onCancel}
              size="extraSmall"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default inject(({ versionHistoryStore, infoPanelStore }) => {
  const { setInfoPanelSelection } = infoPanelStore;

  const {
    fetchFileVersions,
    updateCommentVersion,
    isEditingVersion,
    isEditing,
    fileId,
    setVerHistoryFileId,
    setVerHistoryFileSecurity,
  } = versionHistoryStore;

  const editing = isEditingVersion || isEditing;

  return {
    setInfoPanelSelection,
    fetchFileVersions,
    updateCommentVersion,

    editing,
    setVerHistoryFileId,
    setVerHistoryFileSecurity,
  };
})(CommentEditor);
