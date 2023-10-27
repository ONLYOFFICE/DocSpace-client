import { FolderType, SettingsPageType } from "@docspace/common/constants";

import { isMobile, isTablet } from "@docspace/components/utils/device";

import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import CatalogUserReactSvgUrl from "PUBLIC_DIR/images/catalog.user.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/catalog.rooms.react.svg?url";
import CatalogArchiveReactSvgUrl from "PUBLIC_DIR/images/catalog.archive.react.svg?url";
import CatalogSharedReactSvgUrl from "PUBLIC_DIR/images/catalog.shared.react.svg?url";
import CatalogPortfolioReactSvgUrl from "PUBLIC_DIR/images/catalog.portfolio.react.svg?url";
import CatalogFavoritesReactSvgUrl from "PUBLIC_DIR/images/catalog.favorites.react.svg?url";
import CatalogRecentReactSvgUrl from "PUBLIC_DIR/images/catalog.recent.react.svg?url";
import CatalogPrivateReactSvgUrl from "PUBLIC_DIR/images/catalog.private.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";
import CatalogAccountsReactSvgUrl from "PUBLIC_DIR/images/catalog.accounts.react.svg?url";

import CatalogSettingsCommonReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg?url";
import CatalogSettingsSecurityReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-security.svg?url";
import CatalogSettingsDataManagementReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-data-management.svg?url";
import CatalogSettingsRestoreReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-restore.svg?url";
import CatalogSettingsIntegrationReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import CatalogSettingsDeveloperReactSvgUrl from "PUBLIC_DIR/images/catalog.developer.react.svg?url";
import CatalogSettingsPaymentReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-payment.svg?url";
import CatalogSettingsGiftReactSvgUrl from "PUBLIC_DIR/images/gift.react.svg?url";

import CatalogFolder20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.folder.react.svg?url";
import CatalogUser20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.user.react.svg?url";
import CatalogRooms20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.rooms.react.svg?url";
import CatalogArchive20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.archive.react.svg?url";
import CatalogShared20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.shared.react.svg?url";
import CatalogPortfolio20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.portfolio.react.svg?url";
import CatalogFavorites20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.favorites.react.svg?url";
import CatalogRecent20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.recent.react.svg?url";
import CatalogPrivate20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.private.react.svg?url";
import CatalogTrash20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.trash.react.svg?url";
import CatalogAccounts20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog.accounts.react.svg?url";

import CatalogSettingsCommon20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-common.svg?url";
import CatalogSettingsSecurity20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-security.svg?url";
import CatalogSettingsDataManagement20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-data-management.svg?url";
import CatalogSettingsRestore20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-restore.svg?url";
import CatalogSettingsIntegration20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-integration.svg?url";
import CatalogSettingsDeveloper20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-developer.svg?url";
import CatalogSettingsPayment20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-payment.svg?url";
import CatalogSettingsGift20ReactSvgUrl from "PUBLIC_DIR/images/icons/20/catalog-settings-gift.svg?url";

type FolderUnionType = (typeof FolderType)[keyof typeof FolderType];
type SettingsPageUnionType =
  (typeof SettingsPageType)[keyof typeof SettingsPageType];

type PageType = FolderUnionType | SettingsPageUnionType;
type SizeType = 16 | 20;
type OptionsType = {
  [P in string]: any;
};

const defaultIcon: Record<SizeType, string> = {
  16: CatalogFolderReactSvgUrl,
  20: CatalogFolder20ReactSvgUrl,
};

const icons: Record<SizeType, Partial<Record<PageType, string>>> = {
  16: {
    [FolderType.USER]: CatalogUserReactSvgUrl,
    [FolderType.Rooms]: CatalogRoomsReactSvgUrl,
    [FolderType.Archive]: CatalogArchiveReactSvgUrl,
    [FolderType.SHARE]: CatalogSharedReactSvgUrl,
    [FolderType.COMMON]: CatalogPortfolioReactSvgUrl,
    [FolderType.Favorites]: CatalogFavoritesReactSvgUrl,
    [FolderType.Recent]: CatalogRecentReactSvgUrl,
    [FolderType.Privacy]: CatalogPrivateReactSvgUrl,
    [FolderType.TRASH]: CatalogTrashReactSvgUrl,
    [FolderType.Account]: CatalogAccountsReactSvgUrl,

    [SettingsPageType.customization]: CatalogSettingsCommonReactSvgUrl,
    [SettingsPageType.security]: CatalogSettingsSecurityReactSvgUrl,
    [SettingsPageType.backup]: CatalogSettingsDataManagementReactSvgUrl,
    [SettingsPageType.restore]: CatalogSettingsRestoreReactSvgUrl,
    [SettingsPageType.integration]: CatalogSettingsIntegrationReactSvgUrl,
    [SettingsPageType.developerTools]: CatalogSettingsDeveloperReactSvgUrl,
    [SettingsPageType.portalDeletion]: CatalogTrashReactSvgUrl,
    [SettingsPageType.payments]: CatalogSettingsPaymentReactSvgUrl,
    [SettingsPageType.bonus]: CatalogSettingsGiftReactSvgUrl,
  },
  20: {
    [FolderType.USER]: CatalogUser20ReactSvgUrl,
    [FolderType.Rooms]: CatalogRooms20ReactSvgUrl,
    [FolderType.Archive]: CatalogArchive20ReactSvgUrl,
    [FolderType.SHARE]: CatalogShared20ReactSvgUrl,
    [FolderType.COMMON]: CatalogPortfolio20ReactSvgUrl,
    [FolderType.Favorites]: CatalogFavorites20ReactSvgUrl,
    [FolderType.Recent]: CatalogRecent20ReactSvgUrl,
    [FolderType.Privacy]: CatalogPrivate20ReactSvgUrl,
    [FolderType.TRASH]: CatalogTrash20ReactSvgUrl,
    [FolderType.Account]: CatalogAccounts20ReactSvgUrl,

    [SettingsPageType.customization]: CatalogSettingsCommon20ReactSvgUrl,
    [SettingsPageType.security]: CatalogSettingsSecurity20ReactSvgUrl,
    [SettingsPageType.backup]: CatalogSettingsDataManagement20ReactSvgUrl,
    [SettingsPageType.restore]: CatalogSettingsRestore20ReactSvgUrl,
    [SettingsPageType.integration]: CatalogSettingsIntegration20ReactSvgUrl,
    [SettingsPageType.developerTools]: CatalogSettingsDeveloper20ReactSvgUrl,
    [SettingsPageType.portalDeletion]: CatalogTrash20ReactSvgUrl,
    [SettingsPageType.payments]: CatalogSettingsPayment20ReactSvgUrl,
    [SettingsPageType.bonus]: CatalogSettingsGift20ReactSvgUrl,
  },
};

const MobileIconSize = 20;
const DesktopIconSize = 16;
const NullURL = "";

const isSettingsCatalog = (
  pageType: PageType
): pageType is SettingsPageUnionType => {
  return typeof pageType === "string";
};

export const getCatalogIconUrlByType = (
  pageType: PageType,
  options?: OptionsType
): string => {
  const size: SizeType =
    isMobile() || isTablet() ? MobileIconSize : DesktopIconSize;

  const defaultIconUrl = isSettingsCatalog(pageType)
    ? NullURL
    : defaultIcon[size];

  return icons[size]?.[pageType] ?? defaultIconUrl;
};
