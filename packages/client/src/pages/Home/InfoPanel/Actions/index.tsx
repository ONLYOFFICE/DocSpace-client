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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";

import { Nullable } from "@docspace/shared/types";

import { TRoom } from "@docspace/shared/api/rooms/types";

import { InfoPanelEvents } from "SRC_DIR/helpers/info-panel/enums";
import InfoPanelStore, { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";

type TInfoPanelActionsProps = {
  setView?: InfoPanelStore["setView"];
  setIsVisible?: InfoPanelStore["setIsVisible"];
  setInfoPanelRoom?: InfoPanelStore["setInfoPanelRoom"];
  openMembersTab?: InfoPanelStore["openMembersTab"];
  openShareTab?: InfoPanelStore["openShareTab"];
};

const InfoPanelActions = ({
  setIsVisible,
  setInfoPanelRoom,
  openMembersTab,
  openShareTab,
  setView,
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
    } = infoPanelStore;
    return {
      setIsVisible,
      setInfoPanelRoom,
      openMembersTab,
      openShareTab,
      setView,
    };
  },
)(observer(InfoPanelActions));
