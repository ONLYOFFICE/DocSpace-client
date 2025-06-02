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

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TGroup } from "@docspace/shared/api/groups/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import { InfoPanelEvents } from "SRC_DIR/helpers/info-panel/enums";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

type TInfoPanelActionsProps = {
  setIsVisible?: InfoPanelStore["setIsVisible"];
};

const InfoPanelActions = ({ setIsVisible }: TInfoPanelActionsProps) => {
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

  // Set info panel group
  useEffect(() => {
    const setInfoPanelGroupHandler = (e: CustomEvent<{ group: TGroup }>) => {};

    window.addEventListener(
      InfoPanelEvents.setInfoPanelGroup,
      setInfoPanelGroupHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelGroup,
        setInfoPanelGroupHandler as EventListener,
      );
    };
  }, []);

  // Set info panel file
  useEffect(() => {
    const setInfoPanelFileHandler = (e: CustomEvent<{ file: TFile }>) => {};

    window.addEventListener(
      InfoPanelEvents.setInfoPanelFile,
      setInfoPanelFileHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelFile,
        setInfoPanelFileHandler as EventListener,
      );
    };
  }, []);

  // Set info panel folder
  useEffect(() => {
    const setInfoPanelFolderHandler = (
      e: CustomEvent<{ folder: TFolder }>,
    ) => {};

    window.addEventListener(
      InfoPanelEvents.setInfoPanelFolder,
      setInfoPanelFolderHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelFolder,
        setInfoPanelFolderHandler as EventListener,
      );
    };
  }, []);

  // Set info panel room
  useEffect(() => {
    const setInfoPanelRoomHandler = (e: CustomEvent<{ room: TRoom }>) => {};

    window.addEventListener(
      InfoPanelEvents.setInfoPanelRoom,
      setInfoPanelRoomHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelRoom,
        setInfoPanelRoomHandler as EventListener,
      );
    };
  }, []);

  // Update info panel group
  useEffect(() => {
    const updateInfoPanelGroupHandler = (
      e: CustomEvent<{ group: TGroup }>,
    ) => {};

    window.addEventListener(
      InfoPanelEvents.updateInfoPanelGroup,
      updateInfoPanelGroupHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.updateInfoPanelGroup,
        updateInfoPanelGroupHandler as EventListener,
      );
    };
  }, []);

  // Update info panel file
  useEffect(() => {
    const updateInfoPanelFileHandler = (e: CustomEvent<{ file: TFile }>) => {};

    window.addEventListener(
      InfoPanelEvents.updateInfoPanelFile,
      updateInfoPanelFileHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.updateInfoPanelFile,
        updateInfoPanelFileHandler as EventListener,
      );
    };
  }, []);

  // Update info panel folder
  useEffect(() => {
    const updateInfoPanelFolderHandler = (
      e: CustomEvent<{ folder: TFolder }>,
    ) => {};

    window.addEventListener(
      InfoPanelEvents.updateInfoPanelFolder,
      updateInfoPanelFolderHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.updateInfoPanelFolder,
        updateInfoPanelFolderHandler as EventListener,
      );
    };
  }, []);

  // Update info panel room
  useEffect(() => {
    const updateInfoPanelRoomHandler = (e: CustomEvent<{ room: TRoom }>) => {};

    window.addEventListener(
      InfoPanelEvents.updateInfoPanelRoom,
      updateInfoPanelRoomHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.updateInfoPanelRoom,
        updateInfoPanelRoomHandler as EventListener,
      );
    };
  }, []);

  // Set selected room
  useEffect(() => {
    const setInfoPanelSelectedRoomHandler = (
      e: CustomEvent<{ room: TRoom }>,
    ) => {};

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
  }, []);

  // Set selected group
  useEffect(() => {
    const setInfoPanelSelectedGroupHandler = (
      e: CustomEvent<{ group: TGroup }>,
    ) => {};

    window.addEventListener(
      InfoPanelEvents.setInfoPanelSelectedGroup,
      setInfoPanelSelectedGroupHandler as EventListener,
    );

    return () => {
      window.removeEventListener(
        InfoPanelEvents.setInfoPanelSelectedGroup,
        setInfoPanelSelectedGroupHandler as EventListener,
      );
    };
  }, []);

  // Open share tab
  useEffect(() => {
    const openShareTabHandler = () => {};

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
    const openMembersTabHandler = () => {};

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
    const setFileViewHandler = () => {};

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
    const setRoomsViewHandler = () => {};
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
    const { setIsVisible } = infoPanelStore;
    return { setIsVisible };
  },
)(observer(InfoPanelActions));
