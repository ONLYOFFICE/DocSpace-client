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

import { useRef, useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";

import ContextHelper from "../../helpers/ContextHelper";

const StyledItemContextOptions = styled.div`
  height: 16px;
  margin-block: 0;
  margin-inline: ${({ withLabel }) => (withLabel ? "8px 0" : "auto 0")};
`;

const ItemContextOptions = ({
  t,
  selection,
  getContextOptions,
  getContextOptionActions,
  getUserContextOptions,

  isUser = false,
  itemTitleRef,

  withLabel = false,
}) => {
  if (!selection) return null;

  const [contextHelper, setContextHelper] = useState(null);
  const contextMenuRef = useRef();

  const options = contextHelper?.getItemContextOptions();
  const getData = () => options;

  const onContextMenu = (e) => {
    e.button === 2;
    if (!contextMenuRef?.current.menuRef.current)
      itemTitleRef?.current.click(e);
    contextMenuRef?.current.show(e);
  };

  useEffect(() => {
    contextMenuRef?.current.hide();
    const newContextHelper = new ContextHelper({
      t,
      selection,
      isUser,
      getContextOptions,
      getContextOptionActions,
      getUserContextOptions,
    });

    setContextHelper(newContextHelper);
  }, [selection]);

  return (
    <StyledItemContextOptions withLabel={withLabel}>
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        withBackdrop={true}
        baseZIndex={310}
      />
      {options?.length > 0 && (
        <ContextMenuButton
          id="info-options"
          className="expandButton"
          title={
            selection.isFolder
              ? t("Translations:TitleShowFolderActions")
              : t("Translations:TitleShowActions")
          }
          onClick={onContextMenu}
          getData={getData}
          directionX="right"
          displayType="toggle"
        />
      )}
    </StyledItemContextOptions>
  );
};

export default inject(({ filesStore, peopleStore, contextOptionsStore }) => {
  const { getUserContextOptions } = peopleStore.contextOptionsStore;
  const { getFilesContextOptions: getContextOptions } = filesStore;
  const { getFilesContextOptions: getContextOptionActions } =
    contextOptionsStore;
  return {
    getContextOptions,
    getContextOptionActions,
    getUserContextOptions,
  };
})(observer(ItemContextOptions));
