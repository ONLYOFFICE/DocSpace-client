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

import { useEffect, useState, useRef } from "react";

import RoomType from "@docspace/shared/components/room-type";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { Backdrop } from "@docspace/ui-kit/components";
import { RoomsType } from "@docspace/shared/enums";

import styles from "../../CreateEditRoomDialog.module.scss";

type DropdownDesktopProps = {
  open: boolean;
  chooseRoomType: (roomType: RoomsType) => void;
  onClose: () => void;
};

const DropdownDesktop = ({
  open,
  chooseRoomType,
  onClose,
}: DropdownDesktopProps) => {
  const [heightList, setHeightList] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onHeightCalculation = () => {
    if (!dropdownRef.current) return;
    const screenHeight = document.documentElement.clientHeight;
    const elementHeight = dropdownRef.current.getBoundingClientRect().bottom;
    const elementShadowHeight = 12;
    const buttonHeight = 73;
    const padding = 12;
    const showElementFullHeight =
      screenHeight -
        elementHeight -
        padding / 2 -
        elementShadowHeight -
        buttonHeight >=
      0;

    if (!showElementFullHeight) {
      const newHeightList =
        screenHeight -
        dropdownRef.current.getBoundingClientRect().y -
        elementShadowHeight -
        buttonHeight -
        padding;

      setHeightList(newHeightList);
    } else setHeightList(0);
  };

  useEffect(() => {
    if (open) {
      onHeightCalculation();
      window.addEventListener("resize", onHeightCalculation);
    } else if (typeof heightList === "number") setHeightList(null);

    return () => {
      window.removeEventListener("resize", onHeightCalculation);
    };
  }, [open, heightList]);

  const roomTypes = RoomsTypeValues.map((roomType) => (
    <RoomType
      id={roomType.toString()}
      key={roomType}
      roomType={roomType}
      type="dropdownItem"
      onClick={() => chooseRoomType(roomType)}
      isOpen={false}
      selectedId={roomType.toString()}
    />
  ));

  const content = heightList ? (
    <Scrollbar
      paddingInlineEnd="0"
      paddingAfterLastItem="0"
      style={{ height: heightList, width: "100%" }}
    >
      {roomTypes}
    </Scrollbar>
  ) : (
    roomTypes
  );

  return (
    <>
      <Backdrop
        visible={open}
        onClick={onClose}
        withBackground={false}
        withoutBackground
        isAside
        zIndex={400}
      />
      <div
        className={`${styles.dropdownDesktop}${open && typeof heightList === "number" ? ` ${styles.isOpen}` : ""} dropdown-content-wrapper`}
      >
        <div className="dropdown-content" ref={dropdownRef}>
          {content}
        </div>
      </div>
    </>
  );
};

export default DropdownDesktop;
