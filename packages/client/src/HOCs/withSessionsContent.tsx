// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";

import { useSessionStatusText } from "SRC_DIR/Hooks/useSessionStatusText";
import SessionsStore from "SRC_DIR/store/SessionsStore";
import { TTranslation } from "@docspace/shared/types";
import { TPortalSession } from "@docspace/shared/types/ActiveSessions";

type StoreProps = {
  locale: string;
} & Pick<
  SessionsStore,
  | "selectRow"
  | "selectCheckbox"
  | "singleContextMenuAction"
  | "multipleContextMenuAction"
  | "getContextOptions"
  | "selection"
  | "bufferSelection"
>;

type AddedByHocProps = {
  onRowClick: () => void;
  onRowContextClick: (rightMouseButtonClick?: boolean) => boolean;
  onCheckBoxSelect: (checked: boolean) => void;
  avatarElement: React.ReactElement;
  statusText: string;
  contextOptions: ReturnType<SessionsStore["getContextOptions"]>;
  getContextModel: () => ReturnType<SessionsStore["getContextOptions"]>;
  isChecked: boolean;
  isActive: boolean;
};

type CommonProps = {
  t: TTranslation;
  item: TPortalSession;
};

type WithContentProps<T> = Omit<T, keyof AddedByHocProps> & {
  storeProps?: StoreProps;
};

export default function withSessionsContent<ComponentProps extends CommonProps>(
  WrappedContent: React.ComponentType<ComponentProps>,
) {
  const WithContent = (props: WithContentProps<ComponentProps>) => {
    const { storeProps, ...wrappedComponentProps } = props;
    const { t, item } = wrappedComponentProps;

    const {
      locale,
      selectRow,
      selectCheckbox,
      singleContextMenuAction,
      multipleContextMenuAction,
      getContextOptions,
      selection,
      bufferSelection,
    } = storeProps!;

    const { displayName, avatar, session, isAdmin, isOwner } = item;

    const statusText = useSessionStatusText(session, locale, t);

    const isChecked = selection.some((s) => s.userId === item.userId);
    const isActive = bufferSelection?.userId === item.userId;

    const avatarRole = isOwner
      ? AvatarRole.owner
      : isAdmin
        ? AvatarRole.admin
        : AvatarRole.user;

    const avatarElement = (
      <Avatar
        size={AvatarSize.min}
        role={avatarRole}
        userName={displayName}
        source={avatar}
      />
    );

    const onCheckBoxSelect = (checked: boolean) => {
      selectCheckbox(checked, item);
    };

    const onRowContextClick = (rightMouseButtonClick?: boolean) => {
      if (rightMouseButtonClick) {
        multipleContextMenuAction(item);
      } else {
        singleContextMenuAction(item);
      }
    };

    const onRowClick = (e: React.MouseEvent) => {
      if (
        e.target instanceof Element &&
        (e.target?.tagName === "A" ||
          e.target?.closest(".checkbox") ||
          e.target?.closest(".table-container_row-checkbox") ||
          e.target?.closest(".p-contextmenu") ||
          e.detail === 0)
      ) {
        return;
      }

      selectRow(item);
    };

    const contextOptions = useMemo(
      () => getContextOptions(t),
      [getContextOptions, t],
    );
    const getContextModel = useCallback(
      () => getContextOptions(t),
      [getContextOptions, t],
    );

    return (
      <WrappedContent
        {...(wrappedComponentProps as ComponentProps)}
        isChecked={isChecked}
        isActive={isActive}
        onRowClick={onRowClick}
        onRowContextClick={onRowContextClick}
        contextOptions={contextOptions}
        getContextModel={getContextModel}
        onCheckBoxSelect={onCheckBoxSelect}
        avatarElement={avatarElement}
        statusText={statusText}
      />
    );
  };

  return inject<TStore>(({ settingsStore, userStore, sessionsStore }) => {
    const { culture } = settingsStore;
    const { user } = userStore;
    const locale = (user && user.cultureName) || culture || "en";

    const {
      selectRow,
      selectCheckbox,
      singleContextMenuAction,
      multipleContextMenuAction,
      getContextOptions,
      selection,
      bufferSelection,
    } = sessionsStore;

    return {
      storeProps: {
        locale,
        selectRow,
        selectCheckbox,
        singleContextMenuAction,
        multipleContextMenuAction,
        getContextOptions,
        selection,
        bufferSelection,
      },
    };
  })(observer(WithContent));
}
