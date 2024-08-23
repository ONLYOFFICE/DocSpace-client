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
import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Row } from "@docspace/shared/components/row";
import { IconButton } from "@docspace/shared/components/icon-button";
import styled from "styled-components";

import type SelectionPeopleStore from "SRC_DIR/store/SelectionPeopleStore";
import RemoveSessionSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import SessionsRowContent from "./SessionsRowContent";
import { SessionsRowProps } from "../../UserSessionsPanel.types";

const StyledRow = styled(Row)`
  min-height: 56px;
`;

const SessionsRow = (props: SessionsRowProps) => {
  const {
    item,
    connections,
    setIsDisabled,
    setLogoutDialogVisible = () => {},
    setPlatformData = () => {},
  } = props;

  const isEqualSession = item.id === connections?.id;

  useEffect(() => {
    setIsDisabled(isEqualSession);
  }, [isEqualSession, setIsDisabled]);

  const onClickDisable = () => {
    setLogoutDialogVisible(true);
    setPlatformData(item);
  };

  const contentElement = !isEqualSession && (
    <IconButton
      size={20}
      iconName={RemoveSessionSvgUrl}
      isClickable
      onClick={onClickDisable}
    />
  );

  return (
    <StyledRow
      key={item.id}
      contentElement={contentElement}
      onRowClick={() => {}}
    >
      <SessionsRowContent {...props} />
    </StyledRow>
  );
};

export default inject<TStore>(({ setup, peopleStore }) => {
  const { setLogoutDialogVisible, setPlatformModalData } = setup;
  const { platformData, setPlatformData, items, setIsDisabled } =
    peopleStore.selectionStore as unknown as SelectionPeopleStore;

  return {
    connections: items.connections[0],
    setLogoutDialogVisible,
    setPlatformModalData,
    platformData,
    setPlatformData,
    setIsDisabled,
  };
})(observer(SessionsRow));
