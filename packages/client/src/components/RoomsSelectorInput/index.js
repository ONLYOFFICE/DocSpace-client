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
import { observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { FileInput } from "@docspace/shared/components/file-input";

import RoomSelector from "@docspace/shared/selectors/Room";

import { Aside } from "@docspace/shared/components/aside";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { zIndex } from "@docspace/shared/themes";

import { StyledBodyWrapper } from "./StyledComponents";

const RoomsSelectorInput = (props) => {
  const {
    t,
    isDisabled,
    isError,
    maxWidth,

    id,
    className,
    style,
    isDocumentIcon,
    isLoading,

    roomType,
    onCancel,
    withCancelButton,
    cancelButtonLabel,

    excludeItems,

    withSearch,

    isMultiSelect,

    submitButtonLabel,
    onSubmit,

    withHeader,
    headerProps,

    setIsDataReady,
  } = props;

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const BasePath = `${t("Common:ProductName")} / ${t("Common:Rooms")} `;
  const [path, setPath] = useState("");

  const handleOnSubmit = (rooms) => {
    setPath(`${BasePath}/ ${rooms[0].label}`);
    onSubmit && onSubmit(rooms);
    setIsPanelVisible(false);
  };

  const handleOnCancel = (e) => {
    onCancel && onCancel(e);
    setIsPanelVisible(false);
  };

  const onClick = () => {
    setIsPanelVisible(true);
  };

  const onClose = () => {
    setIsPanelVisible(false);
  };

  const SelectorBody = (
    <RoomSelector
      id={id}
      style={style}
      onCancel={handleOnCancel}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel}
      excludeItems={excludeItems}
      withSearch={withSearch}
      isMultiSelect={isMultiSelect}
      submitButtonLabel={submitButtonLabel}
      onSubmit={handleOnSubmit}
      withHeader={withHeader}
      headerProps={{ ...headerProps, onCloseClick: onClose }}
      setIsDataReady={setIsDataReady}
      roomType={roomType}
    />
  );

  return (
    <StyledBodyWrapper maxWidth={maxWidth} className={className}>
      <FileInput
        onClick={onClick}
        fromStorage
        path={path}
        isLoading={isLoading}
        isDisabled={isDisabled || isLoading}
        hasError={isError}
        scale
        isDocumentIcon={isDocumentIcon}
        placeholder={t("SelectAction")}
      />

      <Backdrop
        visible={isPanelVisible}
        isAside
        withBackground
        zIndex={zIndex.backdrop}
        onClick={onClose}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={zIndex.overlay}
        onClose={onClose}
        withoutHeader
      >
        {SelectorBody}
      </Aside>
    </StyledBodyWrapper>
  );
};

export default withTranslation(["Common"])(observer(RoomsSelectorInput));
