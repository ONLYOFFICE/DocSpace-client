import EmailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import SecurityReactSvgUrl from "PUBLIC_DIR/images/security.react.svg?url";
import ImageReactSvgUrl from "PUBLIC_DIR/images/image.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";
import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import { useState } from "react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";

import { IconButton } from "@docspace/shared/components/icon-button";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import Headline from "@docspace/shared/components/headline/Headline";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import { DeleteSelfProfileDialog } from "SRC_DIR/components/dialogs";
import { DeleteOwnerProfileDialog } from "SRC_DIR/components/dialogs";

import { StyledHeader } from "./StyledHeader";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import TariffBar from "SRC_DIR/components/TariffBar";

const Header = (props) => {
  const {
    t,

    isAdmin,
    isVisitor,
    isCollaborator,

    filter,

    setFilter,

    profile,
    isMe,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,

    setDialogData,

    profileClicked,

    showProfileLoader,
    setIsLoading,
    userId,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [deleteSelfProfileDialog, setDeleteSelfProfileDialog] = useState(false);
  const [deleteOwnerProfileDialog, setDeleteOwnerProfileDialog] =
    useState(false);

  const onChangePasswordClick = () => {
    const email = profile.email;
    setDialogData({ email });
    setChangePasswordVisible(true);
  };

  const onChangeEmailClick = () => {
    setDialogData(profile);
    setChangeEmailVisible(true);
  };

  const getUserContextOptions = () => {
    const options = [
      {
        key: "change-email",
        label: t("PeopleTranslations:EmailChangeButton"),
        onClick: onChangeEmailClick,
        disabled: false,
        icon: EmailReactSvgUrl,
      },
      {
        key: "change-password",
        label: t("PeopleTranslations:PasswordChangeButton"),
        onClick: onChangePasswordClick,
        disabled: false,
        icon: SecurityReactSvgUrl,
      },
      {
        key: "edit-photo",
        label: t("Profile:EditPhoto"),
        onClick: () => setChangeAvatarVisible(true),
        disabled: false,
        icon: ImageReactSvgUrl,
      },
      { key: "separator", isSeparator: true },
      {
        key: "delete-profile",
        label: t("PeopleTranslations:DeleteSelfProfile"),
        onClick: () =>
          profile?.isOwner
            ? setDeleteOwnerProfileDialog(true)
            : setDeleteSelfProfileDialog(true),
        disabled: false,
        icon: CatalogTrashReactSvgUrl,
      },
    ];

    return options;
  };

  const onClickBack = () => {
    if (location?.state?.fromUrl && profileClicked) {
      return navigate(location?.state?.fromUrl);
    }

    if (location.pathname.includes("portal-settings")) {
      return navigate("/portal-settings/customization/general");
    }

    const roomsFilter = RoomsFilter.getDefault(userId);

    roomsFilter.searchArea = RoomSearchArea.Active;
    const urlParams = roomsFilter.toUrlParams(userId);
    const backUrl = `/rooms/shared/filter?${urlParams}`;

    setIsLoading();

    navigate(backUrl);
    // setFilter(filter);
  };

  if (showProfileLoader) return <SectionHeaderSkeleton />;

  return (
    <StyledHeader
      showContextButton={(isAdmin && !profile?.isOwner) || isMe}
      isVisitor={isVisitor || isCollaborator}
    >
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        isFill={true}
        onClick={onClickBack}
        className="arrow-button"
      />

      <Headline className="header-headline" type="content">
        {t("Profile:MyProfile")}
        {profile?.isLDAP && ` (${t("PeopleTranslations:LDAPLbl")})`}
      </Headline>
      <div className="action-button">
        {((isAdmin && !profile?.isOwner) || isMe) && (
          <ContextMenuButton
            directionX="right"
            title={t("Common:Actions")}
            iconName={VerticalDotsReactSvgUrl}
            size={17}
            getData={getUserContextOptions}
            isDisabled={false}
            usePortal={false}
          />
        )}

        <div className="tariff-bar">
          <TariffBar />
        </div>
      </div>

      {deleteSelfProfileDialog && (
        <DeleteSelfProfileDialog
          visible={deleteSelfProfileDialog}
          onClose={() => setDeleteSelfProfileDialog(false)}
          email={profile?.email}
        />
      )}

      {deleteOwnerProfileDialog && (
        <DeleteOwnerProfileDialog
          visible={deleteOwnerProfileDialog}
          onClose={() => setDeleteOwnerProfileDialog(false)}
        />
      )}
    </StyledHeader>
  );
};

export default inject(
  ({
    authStore,
    userStore,
    peopleStore,
    clientLoadingStore,
    profileActionsStore,
  }) => {
    const { isAdmin } = authStore;

    const { isVisitor, isCollaborator, user } = userStore.user;

    const { targetUserStore, filterStore, dialogStore } = peopleStore;

    const { filter, setFilterParams } = filterStore;

    const { targetUser, isMe } = targetUserStore;

    const { showProfileLoader } = clientLoadingStore;

    const { profileClicked } = profileActionsStore;

    const { setChangePasswordVisible, setChangeAvatarVisible } =
      targetUserStore;

    const { setDialogData, setChangeEmailVisible } = dialogStore;

    return {
      isAdmin,
      isVisitor,
      isCollaborator,
      filter,

      setFilter: setFilterParams,

      profile: targetUser,
      userId: user?.id,
      isMe,
      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,

      setDialogData,

      showProfileLoader,
      profileClicked,
    };
  },
)(
  observer(
    withTranslation(["Profile", "Common", "PeopleTranslations"])(Header),
  ),
);
