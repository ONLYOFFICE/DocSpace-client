"use client";

// (c) Copyright Ascensio System SIA 2009-2026
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

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useTranslation, Trans } from "react-i18next";
import {
  now,
  addToDate,
  parseToDateTime,
  isAfter,
} from "@docspace/ui-kit/utils/date";

import {
  EmployeeType,
  ShareAccessRights,
  RoomsType,
} from "@docspace/shared/enums";
import type { TUser } from "@docspace/shared/api/people/types";

import { Button } from "@docspace/ui-kit/components/button";
import { ButtonSize } from "@docspace/ui-kit/components/button/Button.enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import api from "@docspace/shared/api";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { checkIfAccessPaid } from "@docspace/shared/utils/filterPaidRoleOptions";
import PeopleSelector from "@docspace/ui-kit/selectors/People";
import { copyShareLink } from "@docspace/shared/utils/copy";
import { getDefaultAccessUser } from "@docspace/shared/utils/getDefaultAccessUser";
import type { TOption } from "@docspace/ui-kit/components/combobox";
import { getDate } from "@docspace/shared/components/share/Share.helpers";

import ExternalLinks from "./sub-components/ExternalLinks";
import InviteInput from "./sub-components/InviteInput";
import ItemsList from "./sub-components/ItemsList";
import { fixAccess } from "./utils";
import styles from "./InvitePanel.module.scss";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ParseError = {
  message: string | null;
  type: string;
  errorKey?: string;
};

export type InviteItem = {
  id: string | number;
  email?: string;
  displayName?: string;
  avatar?: string | null;
  access: number;
  errors?: ParseError[] | string[];
  isGroup?: boolean;
  name?: string;
  isVisitor?: boolean;
  isCollaborator?: boolean;
  shared?: boolean;
  status?: number;
  isEmailInvite?: boolean;
  userType?: number;
  warning?: string;
  roomType?: RoomsType;
  isSystem?: boolean;
};

export type ShareLink = {
  id?: string;
  title?: string;
  shareLink?: string;
  expirationDate?: string | null;
  access?: number;
  currentUseCount?: number;
  maxUseCount?: number | null;
};

type RoomInfo = {
  roomType?: RoomsType;
  private?: boolean;
};

type RoomSecurityItem = {
  access: number;
  sharedTo: {
    shareLink: string;
    id: string;
    title: string;
    expirationDate: string | null;
    currentUseCount: number;
    maxUseCount: number | null;
  };
};

type RoomSecurityResponse = {
  items: RoomSecurityItem[];
};

type SetRoomSecurityResult = {
  warning?: string;
  members: unknown[];
};

// ─── Props ────────────────────────────────────────────────────────────────────

type InvitePanelProps = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  roomType: RoomsType | -1;
  defaultAccess?: number;
  user?: TUser;
  isPrivateRoom?: boolean;
  culture?: string;
  onMembersUpdated?: () => void;
  /**
   * Invoked after `setRoomSecurity` resolves successfully but BEFORE the panel
   * closes. Private rooms use this hook to run `addMembersToEncryptedRoom`,
   * which wraps file DEKs for the new recipients. The panel surfaces thrown
   * errors as toasts and stays open on failure.
   */
  onInviteSubmitted?: (
    memberIds: string[],
    displayNamesByMemberId: Record<string, string>,
  ) => Promise<void>;
};

// ─── Component ────────────────────────────────────────────────────────────────

const InvitePanel: React.FC<InvitePanelProps> = ({
  visible,
  onClose,
  roomId,
  roomType,
  defaultAccess,
  user,
  isPrivateRoom = false,
  culture,
  onMembersUpdated,
  onInviteSubmitted,
}) => {
  const { t } = useTranslation([
    "InviteDialog",
    "Translations",
    "Common",
    "InfoPanel",
    "Files",
  ]);

  // Derive user-related values from the passed user prop
  const isOwner = user?.isOwner ?? false;
  const isAdmin = user?.isAdmin ?? false;
  const currentUserId = user?.id ?? "";

  const [allowInvitingGuests, setAllowInvitingGuests] = useState(false);

  useEffect(() => {
    api.settings
      .getInvitationSettings()
      .then((res) => {
        setAllowInvitingGuests(res.allowInvitingGuests);
      })
      .catch(() => {});
  }, []);

  const [inviteItems, setInviteItems] = useState<InviteItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalLinksVisible, setExternalLinksVisible] = useState(false);
  const [activeLink, setActiveLink] = useState<ShareLink>({});
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [inputValue, setInputValue] = useState("");
  const [usersList, setUsersList] = useState<InviteItem[]>([]);
  const [showGuestsTab] = useState(true);
  const [isLinksToggling, setIsLinksToggling] = useState(false);
  const [, setLinkSettingsPanelVisible] = useState(false);

  const inputsRef = useRef<HTMLDivElement>(null);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    setInviteItems([]);
    onClose();
  };

  const onBackClick = () => {
    if (addUsersPanelVisible) setAddUsersPanelVisible(false);
  };

  const onCheckHeight = () => {
    setIsMobileView(isMobile());
  };

  const roomTypeResolved: RoomsType | -1 = selectedRoom
    ? (selectedRoom.roomType ?? -1)
    : roomType;

  const onChangeExternalLinksVisible = (v: boolean) => {
    setExternalLinksVisible(v);
  };

  // ─── Room & Link Fetching ────────────────────────────────────────────────────

  const getInfo = useCallback(async (): Promise<void> => {
    const res = (await api.rooms.getRoomSecurityInfo(
      roomId,
    )) as RoomSecurityResponse | null;
    const links = res?.items ?? [];
    const link = links[0];

    if (link) {
      const {
        shareLink,
        id,
        title,
        expirationDate,
        currentUseCount,
        maxUseCount,
      } = link.sharedTo;

      const newLink: ShareLink = {
        id,
        title,
        shareLink,
        expirationDate,
        access: link.access || defaultAccess,
        currentUseCount,
        maxUseCount,
      };

      onChangeExternalLinksVisible(!!links.length);
      setShareLinks([newLink]);
      setActiveLink(newLink);
    }
  }, [roomId, defaultAccess]);

  useEffect(() => {
    const selectRoom = async () => {
      const info = (await api.files.getFolderInfo(roomId)) as RoomInfo;
      setSelectedRoom(info);
    };

    Promise.all([selectRoom(), getInfo()]).catch((err) => {
      console.error("InvitePanel init error:", err);
    });
  }, [roomId, getInfo]);

  useEffect(() => {
    const hasValidationErrors = () =>
      inviteItems.some((item) => !!item.errors?.length);
    const needRemoveGuests = !allowInvitingGuests
      ? inviteItems.some(
          (item) => item.userType === EmployeeType.Guest && !item.status,
        )
      : false;

    setHasErrors(hasValidationErrors() || needRemoveGuests);
  }, [inviteItems, allowInvitingGuests]);

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
    };
  }, []);

  const onKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") handleClose();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  // ─── changeInviteItem (local) ────────────────────────────────────────────────

  const changeInviteItem = useCallback(
    (
      update: Partial<InviteItem> & { id: string | number },
      addExisting = false,
      oldId: string | number | null = null,
    ): Promise<void> => {
      return new Promise<void>((resolve) => {
        setInviteItems((prev) => {
          if (addExisting && oldId !== null) {
            return prev.map((i) =>
              i.id === oldId ? (update as InviteItem) : i,
            );
          }
          return prev.map((i) =>
            i.id === update.id ? { ...i, ...update } : i,
          );
        });
        resolve();
      });
    },
    [],
  );

  // ─── Link Management ─────────────────────────────────────────────────────────

  const copyLink = (link: ShareLink, showToast = true) => {
    if (!link.shareLink) return;

    const expirationDate = link?.expirationDate;
    const isExpired = isAfter(now(), parseToDateTime(expirationDate));
    const isLimit =
      (link?.currentUseCount ?? 0) >= (link?.maxUseCount ?? Infinity);

    if (isExpired) {
      if (!showToast) return;
      return toastr.error(t("Common:LinkExpired"));
    }
    if (isLimit) {
      if (!showToast) return;
      return toastr.error(t("Common:LinkNoLongerAvailable"));
    }

    const date = expirationDate ? getDate(expirationDate) : null;

    const toastTranslation = date ? (
      <Trans
        t={t}
        ns="Common"
        values={{ date }}
        i18nKey="LinkExpireAfter"
        components={{ 1: <strong key="strong-expire-after" /> }}
      />
    ) : (
      <Trans
        t={t}
        ns="Common"
        i18nKey="LinkNoExpiration"
        components={{ 1: <strong key="strong-link-valid" /> }}
      />
    );

    toastr.success(toastTranslation, t("Common:LinkCopiedToClipboard"));
    copyShareLink(link.shareLink);
  };

  const editLink = async (
    linkAccess: number | null = null,
    defaultLink?: ShareLink,
  ): Promise<void> => {
    const type = getDefaultAccessUser(roomTypeResolved as RoomsType);

    const expiration = defaultLink
      ? defaultLink?.expirationDate
      : addToDate(now(), 7, "days");

    let link: RoomSecurityItem | null = null;

    try {
      setIsLinksToggling(true);
      link = (await api.rooms.setInvitationLinks(
        roomId,
        "Invite",
        type,
        undefined,
        expiration,
        defaultLink?.maxUseCount,
      )) as RoomSecurityItem;
      onChangeExternalLinksVisible(true);
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsLinksToggling(false);
    }

    if (!link) return;

    const {
      shareLink,
      id,
      title,
      expirationDate,
      currentUseCount,
      maxUseCount,
    } = link.sharedTo;

    const newShareLink: ShareLink = {
      id,
      title,
      shareLink,
      expirationDate,
      access: linkAccess ?? (link.access || defaultAccess),
      currentUseCount,
      maxUseCount,
    };

    copyLink(newShareLink);
    setShareLinks([newShareLink]);
    setActiveLink(newShareLink);
  };

  const onSelectAccess = async (
    access: TOption & {
      access?: number;
      expirationDate?: string | null;
      maxUseCount?: number | null;
    },
  ) => {
    const selectedAccess = access.access;

    try {
      let linkExpirationDate = parseToDateTime(
        (access.expirationDate as string | undefined) ??
          activeLink?.expirationDate,
      );
      const isExpired = isAfter(now(), linkExpirationDate);

      if (isExpired) {
        linkExpirationDate = addToDate(now(), 7, "days");
      }

      if (access.expirationDate === null) {
        linkExpirationDate = null;
      }

      const maxUsersCount =
        access.maxUseCount !== undefined || access?.maxUseCount === null
          ? access.maxUseCount
          : activeLink?.maxUseCount;

      const newLinkRaw = (await api.rooms.setInvitationLinks(
        roomId,
        "Invite",
        +(selectedAccess ?? 0),
        shareLinks[0]?.id ?? null,
        linkExpirationDate,
        maxUsersCount,
      )) as RoomSecurityItem;

      const {
        shareLink,
        id,
        title,
        expirationDate,
        currentUseCount,
        maxUseCount,
      } = newLinkRaw.sharedTo;

      const newActiveLink: ShareLink = {
        id,
        title,
        shareLink,
        expirationDate,
        access: newLinkRaw.access,
        currentUseCount,
        maxUseCount,
      };

      setActiveLink(newActiveLink);
      copyLink(newActiveLink, false);
    } catch (error) {
      toastr.error(error as Error);
    }
  };

  // ─── Send Invitations ────────────────────────────────────────────────────────

  const onClickSend = async () => {
    const invitations = inviteItems.map((item) => {
      const newItem: {
        access?: number;
        id?: string | number;
        email?: string;
      } = {};

      newItem.access = item.access;

      if (item.avatar || item.isGroup) {
        newItem.id = item.id;
      } else {
        newItem.email = item.email;
      }

      return newItem;
    });

    const data = {
      invitations,
      notify: true,
      message: "Invitation message",
    };

    try {
      setIsLoading(true);
      const result = (await api.rooms.setRoomSecurity(
        roomId,
        data,
      )) as SetRoomSecurityResult;

      if (onInviteSubmitted) {
        const memberIds = invitations
          .map((inv) => inv.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0);
        const displayNames: Record<string, string> = {};
        for (const item of inviteItems) {
          const id = item.id;
          const name = item.displayName ?? item.email;
          if (typeof id === "string" && name) displayNames[id] = name;
        }
        try {
          await onInviteSubmitted(memberIds, displayNames);
        } catch (encryptError) {
          setIsLoading(false);
          toastr.error(encryptError as string | Error);
          return;
        }
      }

      setIsLoading(false);

      handleClose();
      toastr.success(t("Common:UsersInvited"));

      if (result?.warning) {
        toastr.warning(result.warning);
      }

      onMembersUpdated?.();
    } catch (err) {
      const error = err as {
        response?: {
          status?: number;
          data?: {
            error?: { message?: string };
            response?: { errors?: { Invitations?: string[] } };
          };
        };
      };
      let errorMessage: string | Error = err as Error;

      if (error?.response?.data?.response?.errors) {
        const { Invitations } = error.response.data.response.errors;
        if (Invitations) {
          errorMessage = Invitations[0];
        }
      }

      toastr.error(errorMessage as string | Error);
      setIsLoading(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const hasInvitedUsers = !!inviteItems.length;

  const removeExist = (items: InviteItem[]): InviteItem[] => {
    const filtered = items.reduce<InviteItem[]>((unique, current) => {
      const isUnique = !unique.some((obj) =>
        obj.isGroup ? obj.id === current.id : obj.email === current.email,
      );

      if (isUnique) unique.push(current);

      return unique;
    }, []);

    if (items.length > filtered.length) toastr.warning(t("UsersAlreadyAdded"));

    return filtered;
  };

  const closeUsersPanel = () => {
    setAddUsersPanelVisible(false);
  };

  type TSelectorItemArg = {
    id?: string | number;
    access?: number;
    isGroup?: boolean;
    isVisitor?: boolean;
    isCollaborator?: boolean;
    displayName?: string;
    email?: string;
    avatar?: string | null;
    [key: string]: unknown;
  };

  const addItems = (
    users: TSelectorItemArg[],
    access: TOption & { access?: number },
  ) => {
    const mutableUsers = users.map((u) => {
      let mutableUser: InviteItem = {
        id: (u.id as string | number) ?? "",
        access: access.access ?? u.access ?? ShareAccessRights.ReadOnly,
        isGroup: u.isGroup,
        isVisitor: u.isVisitor,
        isCollaborator: u.isCollaborator,
        displayName: u.displayName,
        email: u.email,
        avatar: u.avatar,
      };

      const shouldMakeFreeRole =
        checkIfAccessPaid(mutableUser.access) &&
        (mutableUser.isGroup ||
          mutableUser.isVisitor ||
          mutableUser.isCollaborator);
      const shouldMakeViewerRole =
        roomTypeResolved === RoomsType.AIRoom &&
        mutableUser.isVisitor &&
        mutableUser.access !== ShareAccessRights.ReadOnly;

      if (
        (shouldMakeFreeRole || shouldMakeViewerRole) &&
        roomTypeResolved !== -1
      ) {
        mutableUser = fixAccess(mutableUser, t, roomTypeResolved as RoomsType);
      }

      return mutableUser;
    });

    const items = [...mutableUsers, ...inviteItems];
    const filtered = removeExist(items);

    setInviteItems(filtered);
    setInputValue("");
    setUsersList([]);
    closeUsersPanel();
  };

  // ─── Access Options for PeopleSelector ──────────────────────────────────────

  const accessOptions = getAccessOptions(
    t,
    roomTypeResolved as RoomsType,
    false,
    true,
    isOwner,
    isAdmin,
    false, // standalone = false
  ) as (TOption & { access?: number })[];

  const invitedUsersArray = useMemo(
    () => inviteItems.map((item) => String(item.id)),
    [inviteItems],
  );

  const access = defaultAccess ?? ShareAccessRights.ReadOnly;

  // ─── Body ────────────────────────────────────────────────────────────────────

  const bodyInvitePanel = useMemo(() => {
    const roomTypeForLinks: RoomsType =
      roomTypeResolved === -1
        ? RoomsType.EditingRoom
        : (roomTypeResolved as RoomsType);

    return (
      <div style={{ display: "contents" }}>
        {!isPrivateRoom ? (
          <ExternalLinks
            t={t}
            shareLinks={shareLinks}
            setShareLinks={setShareLinks}
            getInfo={getInfo}
            roomId={roomId}
            roomType={roomTypeForLinks}
            onChangeExternalLinksVisible={onChangeExternalLinksVisible}
            externalLinksVisible={externalLinksVisible}
            setActiveLink={setActiveLink}
            activeLink={activeLink}
            isMobileView={isMobileView}
            setLinkSettingsPanelVisible={setLinkSettingsPanelVisible}
            onSelectAccess={onSelectAccess}
            copyLink={copyLink}
            editLink={editLink}
            isLinksToggling={isLinksToggling}
            setIsLinksToggling={setIsLinksToggling}
            isOwner={isOwner}
            isAdmin={isAdmin}
            allowInvitingGuests={allowInvitingGuests}
            culture={culture}
          />
        ) : null}

        <InviteInput
          t={t}
          roomId={roomId}
          roomType={roomTypeResolved}
          inviteItems={inviteItems}
          setInviteItems={setInviteItems}
          defaultAccess={defaultAccess ?? ShareAccessRights.ReadOnly}
          isOwner={isOwner}
          isAdmin={isAdmin}
          inputsRef={inputsRef}
          setAddUsersPanelVisible={setAddUsersPanelVisible}
          isMobileView={isMobileView}
          removeExist={removeExist}
          inputValue={inputValue}
          setInputValue={setInputValue}
          usersList={usersList}
          setUsersList={setUsersList}
          isPrivateRoom={isPrivateRoom}
          allowInvitingGuests={allowInvitingGuests}
        />

        {hasInvitedUsers ? (
          <ItemsList
            t={t}
            inviteItems={inviteItems}
            setInviteItems={setInviteItems}
            changeInviteItem={changeInviteItem}
            setHasErrors={setHasErrors}
            roomType={roomTypeResolved}
            roomId={roomId}
            isOwner={isOwner}
            isAdmin={isAdmin}
            inputsRef={inputsRef}
            isMobileView={isMobileView}
            allowInvitingGuests={allowInvitingGuests}
          />
        ) : null}
      </div>
    );
  }, [
    t,
    shareLinks,
    getInfo,
    roomTypeResolved,
    externalLinksVisible,
    activeLink,
    isMobileView,
    isLinksToggling,
    isOwner,
    isAdmin,
    allowInvitingGuests,
    culture,
    roomId,
    inviteItems,
    defaultAccess,
    inputValue,
    usersList,
    hasInvitedUsers,
    isPrivateRoom,
    changeInviteItem,
  ]);

  // ─── Access right for PeopleSelector ────────────────────────────────────────

  type TAccessRight = {
    key: string;
    label?: string;
    access?: number;
    type?: string;
    isSepearator?: boolean;
    disabled?: boolean;
  };

  const accessRightsForSelector = (accessOptions as TAccessRight[]).map(
    (o) => ({
      ...o,
      key: String(o.key),
    }),
  );

  const selectedAccessRight =
    accessRightsForSelector.find((a) => a.access === access) ?? null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  // These casts are hoisted out of JSX to avoid `<` / `>` being misread as tags.
  type PeopleSelectorProps = Parameters<typeof PeopleSelector>[0];
  const peopleSelectorOnSubmit =
    addItems as unknown as PeopleSelectorProps["onSubmit"];
  const peopleSelectorAccessRights = (accessRightsForSelector ??
    []) as unknown as NonNullable<PeopleSelectorProps["accessRights"]>;
  const peopleSelectorSelectedAccess = (selectedAccessRight ??
    null) as unknown as NonNullable<PeopleSelectorProps["selectedAccessRight"]>;

  return (
    <ModalDialog
      visible={visible}
      onClose={handleClose}
      onBackClick={onBackClick}
      displayType={ModalDialogType.aside}
      containerVisible={addUsersPanelVisible}
      withBodyScroll
      id="invite_panel_modal"
    >
      {addUsersPanelVisible ? (
        <ModalDialog.Container>
          {!isPrivateRoom ? (
            <PeopleSelector
              useAside
              onClose={() => {
                handleClose();
                closeUsersPanel();
              }}
              onSubmit={peopleSelectorOnSubmit}
              submitButtonLabel={t("Common:AddButton")}
              disableSubmitButton={false}
              withAccessRights
              accessRights={peopleSelectorAccessRights}
              selectedAccessRight={peopleSelectorSelectedAccess}
              onAccessRightsChange={() => {}}
              isMultiSelect
              disableDisabledUsers
              withGroups
              roomId={roomId}
              isAgent={roomTypeResolved === RoomsType.AIRoom}
              disableInvitedUsers={invitedUsersArray}
              withGuests={showGuestsTab}
              withHeader
              data-test-id="invite_panel_people_selector"
              headerProps={{
                headerLabel: t("Common:Contacts"),
                withoutBackButton: false,
                withoutBorder: true,
                isCloseable: true,
                onBackClick: closeUsersPanel,
                onCloseClick: () => {
                  handleClose();
                  closeUsersPanel();
                },
              }}
              currentUserId={String(currentUserId)}
            />
          ) : (
            <PeopleSelector
              useAside
              onClose={() => {
                handleClose();
                closeUsersPanel();
              }}
              onSubmit={peopleSelectorOnSubmit}
              submitButtonLabel={t("Common:AddButton")}
              disableSubmitButton={false}
              withAccessRights
              accessRights={peopleSelectorAccessRights}
              selectedAccessRight={peopleSelectorSelectedAccess}
              onAccessRightsChange={() => {}}
              isMultiSelect
              disableDisabledUsers
              roomId={roomId}
              isAgent={roomTypeResolved === RoomsType.AIRoom}
              disableInvitedUsers={invitedUsersArray}
              withGuests={showGuestsTab}
              withHeader
              data-test-id="invite_panel_people_selector"
              headerProps={{
                headerLabel: t("Common:Contacts"),
                withoutBackButton: false,
                withoutBorder: true,
                isCloseable: true,
                onBackClick: closeUsersPanel,
                onCloseClick: () => {
                  handleClose();
                  closeUsersPanel();
                },
              }}
              currentUserId={String(currentUserId)}
            />
          )}
        </ModalDialog.Container>
      ) : null}

      <ModalDialog.Header>
        <div className={styles.invitePanelHeader}>{t("Common:Invite")}</div>
      </ModalDialog.Header>
      <ModalDialog.Body>{bodyInvitePanel}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-invitation"
          scale
          size={ButtonSize.normal}
          isDisabled={hasErrors || !hasInvitedUsers}
          primary
          onClick={onClickSend}
          label={t("Common:SendInvitation")}
          isLoading={isLoading}
          testId="invite_panel_send_button"
        />
        <Button
          className="cancel-button"
          scale
          size={ButtonSize.normal}
          onClick={handleClose}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          testId="invite_panel_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default InvitePanel;

