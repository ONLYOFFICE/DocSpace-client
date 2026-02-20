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

import classNames from "classnames";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import type { TFile } from "@docspace/shared/api/files/types";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import type {
  NewFilesPanelItemProps,
  NewFilesPanelItemInjectStore,
} from "../NewFilesBadge.types";

import { NewFilesPanelItemDate } from "./NewFilesPanelItemDate";
import { NewFilesPanelItemRoom } from "./NewFilesPanelItemRoom";
import { NewFilesPanelFileList } from "./NewFilesPanelFileList";

import styles from "../new-files-panel.module.scss";

const NewFilesPanelItemComponent = function NewFilesPanelItemComponent({
  date,
  items,
  isRooms,
  isAgents,
  isFirst,
  onClose,

  culture,
  openItemAction,
}: NewFilesPanelItemProps) {
  const { t } = useTranslation(["Files"]);

  return (
    <div
      className={classNames(styles.item, {
        [styles.isRooms]: isRooms || isAgents,
        [styles.isFirst]: isFirst,
      })}
    >
      <NewFilesPanelItemDate date={date} culture={culture} />
      {isRooms || isAgents ? (
        items.map((value) => {
          if ("agent" in value) {
            return (
              <div
                key={`${date}-${value.agent.id}`}
                className="room-items-container"
              >
                <NewFilesPanelItemRoom room={value.agent} onClose={onClose} />
                <NewFilesPanelFileList
                  items={value.items}
                  isRooms
                  onClose={onClose}
                />
              </div>
            );
          }

          if ("room" in value)
            return (
              <div
                key={`${date}-${value.room.id}`}
                className="room-items-container"
              >
                <NewFilesPanelItemRoom {...value} onClose={onClose} />
                {value.room.isNewRoom && (
                  <div className={styles.invitedToRoom}>
                    <div
                      className="info-container"
                      onClick={async () => {
                        openItemAction?.({ ...value.room, isFolder: true });
                        onClose();
                      }}
                    >
                      <IconButton
                        iconName={InfoOutlineReactSvgUrl}
                        size={16}
                        color="accent"
                        className="invited-to-room-icon"
                        isClickable={false}
                      />
                      <Text
                        className="invited-to-room-text"
                        fontSize="12px"
                        fontWeight={400}
                        lineHeight="16px"
                        noSelect
                      >
                        <Trans
                          t={t}
                          ns="Files"
                          i18nKey="InvitedToRoom"
                          values={{ roomName: value.room.title }}
                          components={{
                            1: <strong />,
                          }}
                        />
                      </Text>
                    </div>
                  </div>
                )}
                <NewFilesPanelFileList
                  items={value.items}
                  isRooms
                  onClose={onClose}
                />
              </div>
            );
          return null;
        })
      ) : (
        <NewFilesPanelFileList
          key={date}
          // if not is rooms mode - items is default files
          items={items as unknown as TFile[]}
          isRooms={false}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export const NewFilesPanelItem = inject(
  ({ filesActionsStore }: NewFilesPanelItemInjectStore) => {
    const { openItemAction } = filesActionsStore;
    return { openItemAction };
  },
)(observer(NewFilesPanelItemComponent));
