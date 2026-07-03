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

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { EmptyServerErrorContainer } from "SRC_DIR/components/EmptyContainer/EmptyServerErrorContainer";

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import PromoPage from "./PromoPage";
import TenantPanel from "./TenantPanel";
import BuyPlanPanel from "./BuyPlanPanel";
import CancelPlanDialog from "./CancelPlanDialog";
import TenantPanelLoader from "./TenantPanel/Loader";
import { isDocsConnectCanceled } from "./utils";

interface DocsConnectProps {
  info?: TDocsConnectInfo;
  isLoading?: boolean;
  error?: Error | null;
  buyPlanPanelVisible?: boolean;
  cancelPlanDialogVisible?: boolean;
  fetchInfo?: () => void;
}

const DocsConnect = ({
  info,
  isLoading,
  error,
  buyPlanPanelVisible,
  cancelPlanDialogVisible,
  fetchInfo,
}: DocsConnectProps) => {
  const { t, ready } = useTranslation(["DocsConnect", "Common"]);

  useEffect(() => {
    fetchInfo?.();
  }, [fetchInfo]);

  useEffect(() => {
    if (ready) setDocumentTitle(t("DocsConnect:DocsConnect"));
  }, [ready, t]);

  // Docs Connect renders its own in-body header (title + badge / context menu),
  // so hide the standard sticky section header — same approach as the overview.
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".section-sticky-container, .section-header",
    );
    elements.forEach((el) => {
      el.style.display = "none";
    });
    return () => {
      elements.forEach((el) => {
        el.style.display = "";
      });
    };
  }, []);

  if (!ready) return null;

  if (isLoading) return <TenantPanelLoader />;

  if (error) return <EmptyServerErrorContainer />;

  if (!info) return <PromoPage />;

  if (isDocsConnectCanceled(info)) {
    return (
      <>
        <PromoPage canceled />
        {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
      </>
    );
  }

  return (
    <>
      <TenantPanel />
      {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
      {cancelPlanDialogVisible ? <CancelPlanDialog /> : null}
    </>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  isLoading: docsConnectStore.isLoading,
  error: docsConnectStore.error,
  buyPlanPanelVisible: docsConnectStore.buyPlanPanelVisible,
  cancelPlanDialogVisible: docsConnectStore.cancelPlanDialogVisible,
  fetchInfo: docsConnectStore.fetchInfo,
}))(observer(DocsConnect));
