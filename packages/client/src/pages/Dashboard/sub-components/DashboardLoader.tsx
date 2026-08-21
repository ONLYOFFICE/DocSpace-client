/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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

import type { ReactNode } from "react";
import { inject, observer } from "mobx-react";

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import { DeviceType } from "@docspace/shared/enums";

import { PROFILE_CARD_HIDDEN_KEY } from "./ProfileCard";
import styles from "../Dashboard.module.scss";

// Each loader below mirrors the geometry of its real counterpart so the Overview
// skeleton lines up with the content and there's no layout shift when it
// resolves. They stay in sync with the sidebar's nav skeleton — both gated on
// the same first-load article loader.

// Mirrors the header ({@link ./Header}): greeting + plan subline, with the
// round tour button at the opposite edge. Everyone gets the greeting; only
// admins/owners get the billing-scoped subline, and only non-mobile gets the
// tour button.
const PlanHeaderLoader = ({
  showSubline,
  showTourButton,
}: {
  showSubline: boolean;
  showTourButton: boolean;
}) => (
  <div className={styles.planHeader}>
    <div className={styles.planHeaderText}>
      <RectangleSkeleton width="280px" height="28px" borderRadius="3px" />
      {showSubline ? (
        <RectangleSkeleton width="360px" height="20px" borderRadius="3px" />
      ) : null}
    </div>
    {showTourButton ? (
      <RectangleSkeleton width="32px" height="32px" borderRadius="50%" />
    ) : null}
  </div>
);

// Mirrors the profile card ({@link ./ProfileCard}): title + a 4-field grid,
// each field being a label + value line.
const ProfileCardLoader = () => (
  <div className={styles.profileCard}>
    <RectangleSkeleton width="160px" height="16px" borderRadius="3px" />
    <div className={styles.profileCardGrid}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className={styles.profileCardField}>
          <RectangleSkeleton width="80px" height="12px" borderRadius="3px" />
          <RectangleSkeleton width="120px" height="16px" borderRadius="3px" />
        </div>
      ))}
    </div>
  </div>
);

// Mirrors the "Create new or upload" section: title + quick-action tiles
// (QuickActions renders its own 4-tile skeleton grid when isLoading).
const CreateSectionLoader = () => (
  <section className={styles.section}>
    <RectangleSkeleton width="220px" height="24px" borderRadius="3px" />
    <QuickActions items={[]} isLoading className={styles.quickActions} />
  </section>
);

// Mirrors the "Applications" section ({@link ./ModuleCard}): title + a module
// grid (icon + title row with the state chip, a description line, then the
// action row). The card count matches the installed modules — guests don't get
// the personal Files module.
const ModulesSectionLoader = ({
  count,
  showTourButton,
}: {
  count: number;
  showTourButton: boolean;
}) => (
  <section className={styles.section}>
    <RectangleSkeleton width="120px" height="24px" borderRadius="3px" />
    <div className={styles.modulesGrid}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.loaderModuleCard}>
          <div className={styles.loaderModuleHeader}>
            <RectangleSkeleton width="32px" height="32px" borderRadius="6px" />
            <RectangleSkeleton width="80px" height="16px" borderRadius="3px" />
            <RectangleSkeleton width="72px" height="24px" borderRadius="4px" />
          </div>
          <RectangleSkeleton width="100%" height="32px" borderRadius="3px" />
          {/* Action row: the section button plus the round tour icon beside it
              (the latter only where a tour can run, i.e. not on mobile). */}
          <div className={styles.loaderModuleFooter}>
            <RectangleSkeleton width="100%" height="32px" borderRadius="3px" />
            {showTourButton ? (
              <RectangleSkeleton width="16px" height="16px" borderRadius="50%" />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Shell for an open CollapsibleCard ({@link ./IntegrationsCard},
// {@link ./DevToolsCard}): the filled card box with a title + description header
// and a body slot for the tile grid (both cards default to open).
const CollapsibleCardLoader = ({ children }: { children: ReactNode }) => (
  <div className={styles.loaderCollapsibleCard}>
    <div className={styles.loaderCollapsibleHeader}>
      <RectangleSkeleton width="240px" height="24px" borderRadius="3px" />
      <RectangleSkeleton width="480px" height="20px" borderRadius="3px" />
    </div>
    <div className={styles.loaderCollapsibleBody}>{children}</div>
  </div>
);

// Mirrors the integrations grid ({@link ./IntegrationsCard}): 8 centered tiles
// (7 platforms + the "+20 more" tile), each a name + connect-link line.
const IntegrationsCardLoader = () => (
  <CollapsibleCardLoader>
    <div className={styles.integrationsGrid}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className={styles.loaderIntegrationTile}>
          <RectangleSkeleton width="90px" height="16px" borderRadius="3px" />
          <RectangleSkeleton width="70px" height="14px" borderRadius="3px" />
        </div>
      ))}
    </div>
  </CollapsibleCardLoader>
);

// Mirrors the dev-tools grid ({@link ./DevToolsCard}): 7 tiles, each a title,
// a two-line description and a learn-more link. The first one is the featured
// Docs Connect tile and spans two columns, like in the real card.
const DevToolsCardLoader = () => (
  <CollapsibleCardLoader>
    <div className={styles.devToolsGrid}>
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className={
            index === 0
              ? `${styles.loaderDevToolTile} ${styles.devToolTileFeatured}`
              : styles.loaderDevToolTile
          }
        >
          <RectangleSkeleton width="120px" height="16px" borderRadius="3px" />
          <RectangleSkeleton width="100%" height="12px" borderRadius="3px" />
          <RectangleSkeleton width="70%" height="12px" borderRadius="3px" />
          <RectangleSkeleton width="80px" height="14px" borderRadius="3px" />
        </div>
      ))}
    </div>
  </CollapsibleCardLoader>
);

type DashboardLoaderProps = {
  // Admins/owners see the plan subline and profile card; everyone else doesn't.
  isAdminOrOwner?: boolean;
  // Guests don't get the personal Files module in the Applications grid.
  isGuest?: boolean;
  // The tours target desktop-only chrome, so the header and per-card tour
  // buttons aren't rendered on mobile ({@link ../index}) — skip their
  // placeholders there too.
  currentDeviceType?: TStore["settingsStore"]["currentDeviceType"];
};

const DashboardLoaderComponent = ({
  isAdminOrOwner = false,
  isGuest = false,
  currentDeviceType,
}: DashboardLoaderProps) => {
  // The profile card is admin/owner-only and can be dismissed (persisted in
  // localStorage) — gate its skeleton on the same conditions as the real card
  // so we don't flash a placeholder for a card that won't render.
  const isProfileCardHidden =
    typeof window !== "undefined" &&
    localStorage.getItem(PROFILE_CARD_HIDDEN_KEY) === "true";
  const showProfileCard = isAdminOrOwner && !isProfileCardHidden;

  const moduleCount = isGuest ? 3 : 4;

  const showTourButton = currentDeviceType !== DeviceType.mobile;

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        <PlanHeaderLoader
          showSubline={isAdminOrOwner}
          showTourButton={showTourButton}
        />
        {showProfileCard ? <ProfileCardLoader /> : null}
        <CreateSectionLoader />
        <ModulesSectionLoader
          count={moduleCount}
          showTourButton={showTourButton}
        />
        <IntegrationsCardLoader />
        <DevToolsCardLoader />
      </div>
    </div>
  );
};

export const DashboardLoader = inject<TStore>(
  ({ userStore, settingsStore }) => ({
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
    isGuest: userStore.user?.isVisitor ?? false,
    currentDeviceType: settingsStore.currentDeviceType,
  }),
)(observer(DashboardLoaderComponent));

export default DashboardLoader;

