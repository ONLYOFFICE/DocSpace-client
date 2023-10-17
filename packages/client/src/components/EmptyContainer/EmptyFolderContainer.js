import EmptyScreenPersonalUrl from "PUBLIC_DIR/images/empty_screen_personal.svg?url";
import EmptyScreenPersonalDarkUrl from "PUBLIC_DIR/images/empty_screen_personal_dark.svg?url";
import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import EmptyScreenCorporateDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import EmptyContainer from "./EmptyContainer";
import CommonButtons from "./sub-components/CommonButtons";

const EmptyFolderContainer = ({
  t,
  onCreate,

  linkStyles,

  sectionWidth,
  canCreateFiles,
  theme,
  roomType,
  //isLoading,
  isArchiveFolderRoot,
}) => {
  //const location = useLocation();

  // const isRoom =
  //   isLoading && location?.state?.isRoom ? location?.state?.isRoom : !!roomType;
  const isRoom = !!roomType;
  const displayRoomCondition = isRoom && !isArchiveFolderRoot;

  const buttons = <CommonButtons onCreate={onCreate} linkStyles={linkStyles} />;

  const emptyScreenCorporateSvg = theme.isBase
    ? EmptyScreenCorporateSvgUrl
    : EmptyScreenCorporateDarkSvgUrl;
  const emptyScreenAltSvg = theme.isBase
    ? EmptyScreenPersonalUrl
    : EmptyScreenPersonalDarkUrl;

  return (
    <EmptyContainer
      headerText={
        displayRoomCondition ? t("RoomCreated") : t("EmptyScreenFolder")
      }
      descriptionText={
        canCreateFiles
          ? t("EmptyFolderDecription")
          : t("EmptyFolderDescriptionUser")
      }
      imageSrc={
        displayRoomCondition ? emptyScreenCorporateSvg : emptyScreenAltSvg
      }
      buttons={buttons}
      sectionWidth={sectionWidth}
    />
  );
};

export default inject(
  ({
    auth,
    accessRightsStore,
    selectedFolderStore,
    clientLoadingStore,
    treeFoldersStore,
  }) => {
    const { roomType } = selectedFolderStore;

    const { canCreateFiles } = accessRightsStore;

    const { isLoading } = clientLoadingStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    return {
      isLoading,

      roomType,
      canCreateFiles,
      isArchiveFolderRoot,
      theme: auth.settingsStore.theme,
    };
  }
)(withTranslation(["Files", "Translations"])(observer(EmptyFolderContainer)));
