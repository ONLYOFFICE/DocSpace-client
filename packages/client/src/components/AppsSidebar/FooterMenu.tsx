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

import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import { NavMenu } from "@docspace/ui-kit/components/nav-menu";
import type {
  NavMenuGroup,
  NavMenuItem,
} from "@docspace/ui-kit/components/nav-menu";

import ContactsIconUrl from "PUBLIC_DIR/images/icons/16/catalog.accounts.react.svg?url";
import BillingIconUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-payment.svg?url";
import DeveloperIconUrl from "PUBLIC_DIR/images/icons/16/catalog.developer.react.svg?url";
import SettingsIconUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";

const CONTACTS_ID = "footer-contacts";
const BILLING_ID = "footer-billing";
const DEVELOPER_ID = "footer-developer-tools";
const SETTINGS_ID = "footer-settings";

type FooterMenuProps = {
  showText: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isVisitor: boolean;
  isCollaborator: boolean;
  isNotPaidPeriod: boolean;
};

const FooterMenu = ({
  showText,
  isAdmin,
  isOwner,
  isVisitor,
  isCollaborator,
  isNotPaidPeriod,
}: FooterMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(["Common"]);

  const isAdminOrOwner = isAdmin || isOwner;
  const showContacts = !isNotPaidPeriod && !isVisitor && !isCollaborator;
  const showBilling = isAdminOrOwner && !isNotPaidPeriod;
  const showDeveloperTools = isAdminOrOwner;
  const showSettings = isAdminOrOwner && !isNotPaidPeriod;

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const items: NavMenuItem[] = [];

    if (showContacts) {
      items.push({
        id: CONTACTS_ID,
        label: t("Common:Contacts"),
        icon: ContactsIconUrl,
        onClick: () => navigate("/accounts/people"),
      });
    }
    if (showBilling) {
      items.push({
        id: BILLING_ID,
        label: t("Common:Billing"),
        icon: BillingIconUrl,
        onClick: () =>
          navigate("/portal-settings/payments/portal-payments"),
      });
    }
    if (showDeveloperTools) {
      items.push({
        id: DEVELOPER_ID,
        label: t("Common:DeveloperTools"),
        icon: DeveloperIconUrl,
        onClick: () => navigate("/developer-tools/overview"),
      });
    }
    if (showSettings) {
      items.push({
        id: SETTINGS_ID,
        label: t("Common:Settings"),
        icon: SettingsIconUrl,
        onClick: () => navigate("/portal-settings"),
      });
    }

    return items.length > 0 ? [{ id: "footer", items }] : [];
  }, [
    t,
    navigate,
    showContacts,
    showBilling,
    showDeveloperTools,
    showSettings,
  ]);

  const activeId = React.useMemo(() => {
    const { pathname } = location;
    if (pathname.startsWith("/accounts")) return CONTACTS_ID;
    if (pathname.startsWith("/portal-settings/payments")) return BILLING_ID;
    if (pathname.startsWith("/developer-tools")) return DEVELOPER_ID;
    if (pathname.startsWith("/portal-settings")) return SETTINGS_ID;
    return undefined;
  }, [location]);

  if (groups.length === 0) return null;

  return <NavMenu groups={groups} activeItemId={activeId} iconOnly={!showText} />;
};

export default FooterMenu;

