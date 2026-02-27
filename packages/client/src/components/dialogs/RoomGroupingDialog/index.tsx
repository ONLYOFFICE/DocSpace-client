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
// All the Product's GUI elements, including illustrations, icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import classNames from "classnames";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { SearchInput } from "@docspace/ui-kit/components/search-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { isDesktop } from "@docspace/shared/utils";
import MailIconUrl from "PUBLIC_DIR/images/mail.svg?url";
import MailIconTabletUrl from "PUBLIC_DIR/images/mail.tablet.svg?url";
import AlertIconUrl from "PUBLIC_DIR/images/bell.svg?url";
import AlertTabletIconUrl from "PUBLIC_DIR/images/bell.tablet.svg?url";
import styles from "./RoomGroupingDialog.module.scss";

type RoomGroupingDialogProps = {
  visible?: boolean;
  setOrganizeRoomsGrouping: (enabled: boolean) => Promise<boolean>;
  setRoomGroupingDialogVisible: (visible: boolean) => void;
};

const RoomGroupingDialog = ({
  visible = false,
  setOrganizeRoomsGrouping,
  setRoomGroupingDialogVisible,
}: RoomGroupingDialogProps) => {
  const { t } = useTranslation(["Common", "GroupingRooms"]);
  const [isDesktopView, setIsDesktopView] = useState(isDesktop());

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopView(isDesktop());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEnableNow = async () => {
    await setOrganizeRoomsGrouping(true);
    localStorage.setItem("roomGroupingDialogShown", "true");
    setRoomGroupingDialogVisible(false);
  };

  const onClose = () => {
    localStorage.setItem("roomGroupingDialogShown", "true");
    setRoomGroupingDialogVisible(false);
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("GroupingRooms:RoomGrouping")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.content}>
          <div
            className={classNames(styles.searchBarContainer, styles.fadeRight, {
              [styles.searchBarContainerTablet]: !isDesktopView,
            })}
          >
            <SearchInput
              placeholder={t("Common:Search")}
              value=""
              scale
              size={InputSize.base}
            />
          </div>

          <div
            className={classNames(styles.tagsContainer, styles.fadeRight, {
              [styles.tagsContainerTablet]: !isDesktopView,
            })}
          >
            <div
              className={classNames(styles.tag, {
                [styles.tagActive]: isDesktopView,
                [styles.tagTablet]: !isDesktopView,
              })}
            >
              <div
                className={classNames(styles.tagName, {
                  [styles.tagNameTablet]: !isDesktopView,
                })}
              >
                {t("Common:AllRooms")}
              </div>
            </div>

            <div
              className={classNames(styles.tag, {
                [styles.tagActive]: !isDesktopView,
                [styles.tagTablet]: !isDesktopView,
              })}
            >
              <ReactSVG
                src={isDesktopView ? MailIconUrl : MailIconTabletUrl}
                className={classNames(styles.tagIcon, {
                  [styles.tagIconActive]: !isDesktopView,
                  [styles.tagIconTablet]: !isDesktopView,
                })}
              />

              <div
                className={classNames(styles.tagName, {
                  [styles.tagNameTablet]: !isDesktopView,
                })}
              >
                {t("GroupingRooms:MailRooms")}
              </div>
            </div>
            <div
              className={classNames(styles.tag, {
                [styles.tagTablet]: !isDesktopView,
              })}
            >
              <ReactSVG
                src={isDesktopView ? AlertIconUrl : AlertTabletIconUrl}
                className={classNames(styles.tagIcon, {
                  [styles.tagIconTablet]: !isDesktopView,
                })}
              />

              <div
                className={classNames(styles.tagName, {
                  [styles.tagNameTablet]: !isDesktopView,
                })}
              >
                {t("GroupingRooms:EventsRooms")}
              </div>
            </div>
          </div>

          {isDesktopView ? (
            <div
              className={classNames(styles.sectionTile, {
                [styles.isDesktopFade]: isDesktopView,
              })}
            >
              <div className={styles.sectionFlexTablet}>
                <div
                  className={`${styles.tileName} ${styles.onlyTileName} ${styles.borderColor}`}
                >
                  <div className={styles.tileContainer}>
                    <div className={styles.tileIcon}>
                      <RectangleSkeleton
                        animate={false}
                        width="32"
                        height="32"
                        className={styles.loadersTheme}
                      />
                    </div>

                    <div className={styles.tileTitle}>
                      <RectangleSkeleton
                        animate={false}
                        width="175"
                        height="18"
                        className={styles.loadersTheme}
                      />
                    </div>

                    <div className={styles.tileBadgeDesktop}>
                      <RectangleSkeleton
                        animate={false}
                        width="16"
                        height="16"
                        className={styles.loadersTheme}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.tileName} ${styles.onlyTileName}  ${styles.borderColor} ${styles.tabletTileName}`}
                >
                  <div className={styles.tileContainer}>
                    <div className={styles.tileIcon}>
                      <RectangleSkeleton
                        animate={false}
                        width="32"
                        height="32"
                        className={styles.loadersTheme}
                      />
                    </div>

                    <div className={styles.tileTitleShort}>
                      <RectangleSkeleton
                        animate={false}
                        width="18"
                        height="18"
                        className={styles.loadersTheme}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.sectionTile}>
              <div className={`${styles.sectionTablet} ${styles.fadeRight}`}>
                <div className={styles.tileTablet}>
                  <div className={`${styles.borderColor}`}>
                    <div
                      className={`${styles.tileContainer} ${styles.tileContainerTablet}`}
                    >
                      <div
                        className={`${styles.tileIcon} ${styles.tileIconShort}`}
                      >
                        <RectangleSkeleton
                          animate={false}
                          width="20"
                          height="20"
                          className={styles.loadersTheme}
                        />
                      </div>

                      <div
                        className={`${styles.tileTitle} ${styles.tileTitleTablet}`}
                      >
                        <RectangleSkeleton
                          animate={false}
                          width="112"
                          height="11"
                          className={styles.loadersTheme}
                        />
                      </div>

                      <div className={styles.tileBadge}>
                        <RectangleSkeleton
                          animate={false}
                          width="10"
                          height="10"
                          className={styles.loadersTheme}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.tileBottom}>
                    <RectangleSkeleton
                      animate={false}
                      width="32"
                      height="15"
                      className={styles.loadersTheme}
                    />
                    <RectangleSkeleton
                      animate={false}
                      width="32"
                      height="15"
                      className={styles.loadersTheme}
                    />
                  </div>
                </div>
                <div className={styles.tileTablet}>
                  <div className={`${styles.borderColor}`}>
                    <div
                      className={`${styles.tileContainer} ${styles.tileContainerTablet}`}
                    >
                      <div
                        className={`${styles.tileIcon} ${styles.tileIconShort}`}
                      >
                        <RectangleSkeleton
                          animate={false}
                          width="20"
                          height="20"
                          className={styles.loadersTheme}
                        />
                      </div>

                      <div
                        className={`${styles.tileTitle} ${styles.tileTitleTablet}`}
                      >
                        <RectangleSkeleton
                          animate={false}
                          width="112"
                          height="11"
                          className={styles.loadersTheme}
                        />
                      </div>

                      <div className={styles.tileBadge}>
                        <RectangleSkeleton
                          animate={false}
                          width="10"
                          height="10"
                          className={styles.loadersTheme}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.tileBottom}>
                    <RectangleSkeleton
                      animate={false}
                      width="32"
                      height="15"
                      className={styles.loadersTheme}
                    />
                    <RectangleSkeleton
                      animate={false}
                      width="32"
                      height="15"
                      className={styles.loadersTheme}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.description}>
          {t("GroupingRooms:RoomGroupingDescription", {
            productName: t("Common:ProductName"),
          })}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          label={t("GroupingRooms:EnableNow")}
          onClick={handleEnableNow}
          scale
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:Later")}
          onClick={onClose}
          minWidth="92px"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, filesSettingsStore }: TStore) => {
  const { roomGroupingDialogVisible, setRoomGroupingDialogVisible } =
    dialogsStore;
  const { setOrganizeRoomsGrouping } = filesSettingsStore;

  return {
    visible: roomGroupingDialogVisible,
    setRoomGroupingDialogVisible,
    setOrganizeRoomsGrouping,
  };
})(observer(RoomGroupingDialog));
