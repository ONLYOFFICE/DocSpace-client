import FileActionsLockedReactSvgUrl from "PUBLIC_DIR/images/file.actions.locked.react.svg?url";
import FileActionsDownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import LinkReactSvgUrl from "PUBLIC_DIR/images/link.react.svg?url";
import LockedReactSvgUrl from "PUBLIC_DIR/images/locked.react.svg?url";
import FileActionsFavoriteReactSvgUrl from "PUBLIC_DIR/images/file.actions.favorite.react.svg?url";
import FavoriteReactSvgUrl from "PUBLIC_DIR/images/favorite.react.svg?url";
import LifetimeReactSvgUrl from "PUBLIC_DIR/images/lifetime.react.svg?url";
import styled from "styled-components";
import { isTablet } from "@docspace/components/utils/device";
import { FileStatus, RoomsType } from "@docspace/common/constants";
import { ColorTheme, ThemeType } from "@docspace/components/ColorTheme";
import Tooltip from "@docspace/components/tooltip";
import Text from "@docspace/components/text";

const StyledQuickButtons = styled.div`
  .file-lifetime {
    svg {
      rect {
        fill: ${({ theme }) => theme.filesQuickButtons.lifeTimeColor};
      }

      circle,
      path {
        stroke: ${({ theme }) => theme.filesQuickButtons.lifeTimeColor};
      }
    }
  }
`;

const QuickButtons = (props) => {
  const {
    t,
    item,
    theme,
    sectionWidth,
    onClickLock,
    onClickDownload,
    onCopyPrimaryLink,
    isDisabled,
    onClickFavorite,
    viewAs,
    folderCategory,
    isPublicRoom,
    isArchiveFolder,
  } = props;

  const { id, locked, fileStatus, title, fileExst } = item;

  const isFavorite =
    (fileStatus & FileStatus.IsFavorite) === FileStatus.IsFavorite;

  const isTile = viewAs === "tile";

  const iconLock = locked ? FileActionsLockedReactSvgUrl : LockedReactSvgUrl;

  const colorLock = locked
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const iconFavorite = isFavorite
    ? FileActionsFavoriteReactSvgUrl
    : FavoriteReactSvgUrl;

  const colorFavorite = isFavorite
    ? theme.filesQuickButtons.sharedColor
    : theme.filesQuickButtons.color;

  const tabletViewQuickButton = isTablet();

  const sizeQuickButton = isTile || tabletViewQuickButton ? "medium" : "small";

  const displayBadges = viewAs === "table" || isTile || tabletViewQuickButton;

  const setFavorite = () => onClickFavorite(isFavorite);

  const isAvailableLockFile =
    !folderCategory && fileExst && displayBadges && item.security.Lock;
  const isAvailableDownloadFile =
    isPublicRoom && item.security.Download && viewAs === "tile";

  const showCopyLinkIcon =
    (item.roomType === RoomsType.PublicRoom ||
      item.roomType === RoomsType.CustomRoom) &&
    item.shared &&
    !isArchiveFolder &&
    !isTile;

  //const showLifetimeIcon = item.lifetime < item.lifetime * 0.1
  const showLifetimeIcon = true;

  const fileDeleteDate = "22.02 12:08 PM"; // TODO:

  const getTooltipContent = () => (
    <Text fontSize="12px" fontWeight={400} noSelect>
      {t("Files:FileWillBeDeleted", { date: fileDeleteDate })}.
    </Text>
  );

  return (
    <StyledQuickButtons className="badges additional-badges  badges__quickButtons">
      {showLifetimeIcon && (
        <>
          <ColorTheme
            themeId={ThemeType.IconButton}
            iconName={LifetimeReactSvgUrl}
            className="badge file-lifetime icons-group"
            size={sizeQuickButton}
            isClickable
            isDisabled={isDisabled}
            data-tooltip-id="lifetimeTooltip"
            color={theme.filesQuickButtons.lifeTimeColor}
          />

          <Tooltip
            id="lifetimeTooltip"
            place="bottom"
            getContent={getTooltipContent}
            maxWidth="300px"
          />
        </>
      )}

      {isAvailableLockFile && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={iconLock}
          className="badge lock-file icons-group"
          size={sizeQuickButton}
          data-id={id}
          data-locked={locked ? true : false}
          onClick={onClickLock}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("UnblockVersion")}
        />
      )}
      {isAvailableDownloadFile && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={FileActionsDownloadReactSvgUrl}
          className="badge download-file icons-group"
          size={sizeQuickButton}
          onClick={onClickDownload}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("Common:Download")}
        />
      )}
      {showCopyLinkIcon && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={LinkReactSvgUrl}
          className="badge copy-link icons-group"
          size={sizeQuickButton}
          onClick={onCopyPrimaryLink}
          color={colorLock}
          isDisabled={isDisabled}
          hoverColor={theme.filesQuickButtons.sharedColor}
          title={t("Files:CopyGeneralLink")}
        />
      )}
      {/* {fileExst && !isTrashFolder && displayBadges && (
        <ColorTheme
          themeId={ThemeType.IconButton}
          iconName={iconFavorite}
          isFavorite={isFavorite}
          className="favorite badge icons-group"
          size={sizeQuickButton}
          data-id={id}
          data-title={title}
          color={colorFavorite}
          onClick={setFavorite}
          hoverColor={theme.filesQuickButtons.hoverColor}
        />
      )} */}
    </StyledQuickButtons>
  );
};

export default QuickButtons;
