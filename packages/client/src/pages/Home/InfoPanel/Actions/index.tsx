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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";

import { Nullable } from "@docspace/shared/types";

import { TRoom } from "@docspace/shared/api/rooms/types";
import { InfoPanelEvents } from "@docspace/shared/enums";

import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import type { InfoPanelView } from "SRC_DIR/helpers/info-panel";

type TInfoPanelActionsProps = {
  setView?: InfoPanelStore["setView"];
  setIsVisible?: InfoPanelStore["setIsVisible"];
  setInfoPanelRoom?: InfoPanelStore["setInfoPanelRoom"];
  openMembersTab?: InfoPanelStore["openMembersTab"];
  openShareTab?: InfoPanelStore["openShareTab"];
  refreshInfoPanel?: InfoPanelStore["refreshInfoPanel"];
};

const InfoPanelActions = ({
  setIsVisible,
  setInfoPanelRoom,
  openMembersTab,
  openShareTab,
  setView,
  refreshInfoPanel,
}: TInfoPanelActionsProps) => {
  // Show info panel
  useEffect(() => {
    const showInfoPanelHandler = () => {
      setIsVisible!(true);
    };

    window.addEventListener(
      InfoPanelEvents.showInfoPanel,
      showInfoPanelHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.showInfoPanel,
        showInfoPanelHandler as EventListener,
      );
    };
  }, [setIsVisible]);

  // Hide info panel
  useEffect(() => {
    const hideInfoPanelHandler = () => {
      setIsVisible!(false);
    };

    window.addEventListener(
      InfoPanelEvents.hideInfoPanel,
      hideInfoPanelHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.hideInfoPanel,
        hideInfoPanelHandler as EventListener,
      );
    };
  }, [setIsVisible]);

  // Set selected room
  useEffect(() => {
    const setInfoPanelSelectedRoomHandler = (
      e: CustomEvent<{ room: Nullable<TRoom>; withCheck?: boolean }>,
    ) => {
      const { room, withCheck } = e.detail;

      setInfoPanelRoom!(room, withCheck);
    };

    window.addEventListener(
      InfoPanelEvents.setInfoPanelSelectedRoom,
      setInfoPanelSelectedRoomHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelSelectedRoom,
        setInfoPanelSelectedRoomHandler as EventListener,
      );
    };
  }, [setInfoPanelRoom]);

  // Open share tab
  useEffect(() => {
    const openShareTabHandler = () => {
      openShareTab!();
    };

    window.addEventListener(
      InfoPanelEvents.openShareTab,
      openShareTabHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.openShareTab,
        openShareTabHandler as EventListener,
      );
    };
  }, []);

  // Open members tab
  useEffect(() => {
    const openMembersTabHandler = () => {
      openMembersTab!();
    };

    window.addEventListener(
      InfoPanelEvents.openMembersTab,
      openMembersTabHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.openMembersTab,
        openMembersTabHandler as EventListener,
      );
    };
  }, []);

  // Set file view
  useEffect(() => {
    const setFileViewHandler = (e: CustomEvent<{ view: InfoPanelView }>) => {
      setView!(e.detail.view);
    };

    window.addEventListener(
      InfoPanelEvents.setFileView,
      setFileViewHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setFileView,
        setFileViewHandler as EventListener,
      );
    };
  }, []);

  // Set rooms view
  useEffect(() => {
    const setRoomsViewHandler = (e: CustomEvent<{ view: InfoPanelView }>) => {
      setView!(e.detail.view);
    };
    window.addEventListener(
      InfoPanelEvents.setRoomsView,
      setRoomsViewHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setRoomsView,
        setRoomsViewHandler as EventListener,
      );
    };
  }, []);

  // Refresh info panel
  useEffect(() => {
    const refreshInfoPanelHandler = () => {
      refreshInfoPanel!();
    };
    window.addEventListener(
      InfoPanelEvents.refreshInfoPanel,
      refreshInfoPanelHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.refreshInfoPanel,
        refreshInfoPanelHandler as EventListener,
      );
    };
  }, []);

  return null;
};

export default inject(
  ({ infoPanelStore }: { infoPanelStore: InfoPanelStore }) => {
    const {
      setIsVisible,
      setInfoPanelRoom,
      openMembersTab,
      openShareTab,
      setView,
      refreshInfoPanel,
    } = infoPanelStore;
    return {
      setIsVisible,
      setInfoPanelRoom,
      openMembersTab,
      openShareTab,
      setView,
      refreshInfoPanel,
    };
  },
)(observer(InfoPanelActions));
