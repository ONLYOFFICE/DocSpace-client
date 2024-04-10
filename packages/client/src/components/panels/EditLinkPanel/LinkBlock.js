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

import React from "react";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { TextInput } from "@docspace/shared/components/text-input";
import { FieldContainer } from "@docspace/shared/components/field-container";

const LinkBlock = (props) => {
  const {
    t,
    isEdit,
    isLoading,
    shareLink,
    linkNameValue,
    setLinkNameValue,
    linkValue,
    setLinkValue,
  } = props;

  const onChangeLinkName = (e) => {
    setLinkNameValue(e.target.value);
  };

  return (
    <div className="edit-link_link-block">
      <Text className="edit-link-text" fontSize="16px" fontWeight={600}>
        {t("LinkName")}
      </Text>
      <Text className="edit-link_required-icon" color="#F24724">
        *
      </Text>

      <TextInput
        scale
        size="base"
        withBorder
        isAutoFocussed
        className="edit-link_name-input"
        value={linkNameValue}
        onChange={onChangeLinkName}
        placeholder={t("LinkName")}
        isDisabled={isLoading}
      />

      {isEdit && (
        <TextInput
          scale
          size="base"
          withBorder
          isDisabled
          isReadOnly
          className="edit-link_link-input"
          value={linkValue}
          placeholder={t("LinkName")}
        />
      )}
    </div>
  );
};

export default LinkBlock;
