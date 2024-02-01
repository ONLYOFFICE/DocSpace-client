import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import EmptyContainer from "./EmptyContainer";
import CommonButtons from "./sub-components/CommonButtons";
import {
  getDescriptionText,
  getEmptyScreenType,
  getHeaderText,
  getThemeMode,
  headerIconsUrl,
} from "./EmptyContainer.helper";

const EmptyFolderContainer = ({
  t,
  onCreate,
  type, // folder type
  linkStyles,
  sectionWidth,
  canCreateFiles,
  theme,
  roomType,
  isArchiveFolderRoot,
  isEmptyPage,
}) => {
  const isRoom = !!roomType;
  const displayRoomCondition = isRoom && !isArchiveFolderRoot;

  const buttons = <CommonButtons onCreate={onCreate} linkStyles={linkStyles} />;

  const getIcon = useCallback(() => {
    const themeMode = getThemeMode(theme);
    const emptyScreenType = getEmptyScreenType(type, displayRoomCondition);
    const icon = headerIconsUrl[themeMode][emptyScreenType];

    return icon;
  }, [theme.isBase, displayRoomCondition, type]);

  const imageSrc = useMemo(getIcon, [getIcon]);
  const headerText = useMemo(
    () => getHeaderText(type, displayRoomCondition, t),
    [t, displayRoomCondition, type]
  );

  const descriptionText = useMemo(
    () => getDescriptionText(type, canCreateFiles, t),
    [t, canCreateFiles, type]
  );

  return (
    <EmptyContainer
      headerText={headerText}
      descriptionText={descriptionText}
      buttons={buttons}
      imageSrc={imageSrc}
      isEmptyPage={isEmptyPage}
      sectionWidth={sectionWidth}
    />
  );
};

export default inject(
  ({
    settingsStore,
    accessRightsStore,
    selectedFolderStore,
    clientLoadingStore,
    treeFoldersStore,
    filesStore,
  }) => {
    const { roomType } = selectedFolderStore;

    const { canCreateFiles } = accessRightsStore;

    const { isLoading } = clientLoadingStore;
    const { isArchiveFolderRoot } = treeFoldersStore;

    const { isEmptyPage } = filesStore;

    return {
      isLoading,

      roomType,
      canCreateFiles,
      isArchiveFolderRoot,
      theme: settingsStore.theme,
      isEmptyPage,
    };
  }
)(withTranslation(["Files", "Translations"])(observer(EmptyFolderContainer)));
