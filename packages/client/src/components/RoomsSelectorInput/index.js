/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { FileInput } from "@docspace/ui-kit/components/file-input";

import RoomSelector from "@docspace/ui-kit/selectors/Room";

import { Aside } from "@docspace/ui-kit/components/aside";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { getBrandName } from "@docspace/shared/constants/brands";

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
  const BasePath = `${getBrandName("ProductName")} / ${t("Common:Rooms")} `;
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

  const bodyWrapperStyle = { maxWidth: maxWidth || "350px", margin: "16px 0" };

  return (
    <div style={bodyWrapperStyle} className={className}>
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
        zIndex={309}
        onClick={onClose}
      />
      <Aside
        visible={isPanelVisible}
        withoutBodyScroll
        zIndex={310}
        onClose={onClose}
        withoutHeader
      >
        {SelectorBody}
      </Aside>
    </div>
  );
};

export default withTranslation(["Common"])(observer(RoomsSelectorInput));
