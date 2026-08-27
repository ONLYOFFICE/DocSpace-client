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

import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType, LinkTarget } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import config from "PACKAGE_FILE";

import { DOCS_CONNECT_LINKS, DOCS_CONNECT_ROUTE } from "./constants";

import styles from "./PromoPage.module.scss";

interface PromoPageProps {
  canceled?: boolean;
  startTrial?: () => Promise<void>;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  canManage?: boolean;
}

const PromoPage = ({
  canceled,
  startTrial,
  openBuyPlan,
  canManage,
}: PromoPageProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const [submitting, setSubmitting] = useState(false);

  const onCreateTenant = async () => {
    if (submitting || !canManage) return;
    setSubmitting(true);
    try {
      await startTrial?.();
      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        DOCS_CONNECT_ROUTE,
      );
    } catch (error) {
      toastr.error(error as Error);
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.promo} data-testid="docs_connect_promo">
      <Heading level={HeadingLevel.h1} className={styles.title}>
        {t("DocsConnect:DocsConnect")}
      </Heading>

      {canceled ? (
        <div className={styles.canceledText}>
          <Text as="p" className={styles.canceledTitle}>
            {t("DocsConnect:SubscriptionCanceledTitle", {
              service: t("DocsConnect:DocsConnect"),
            })}
          </Text>
          <Text as="p" className={styles.description}>
            {t("DocsConnect:SubscriptionCanceledDescription")}
          </Text>
        </div>
      ) : (
        <>
          <Text as="p" className={styles.description}>
            <Trans
              t={t}
              i18nKey="PromoDescription"
              ns="DocsConnect"
              components={{
                1: (
                  <Link
                    className={styles.link}
                    type={LinkType.page}
                    href={DOCS_CONNECT_LINKS.connectors}
                    target={LinkTarget.blank}
                    color="accent"
                  />
                ),
              }}
            />
          </Text>

          <div className={styles.devPackNote}>
            <Text as="p" className={styles.description}>
              <Trans
                t={t}
                i18nKey="PromoDevPackNote"
                ns="DocsConnect"
                components={{
                  1: (
                    <Link
                      className={styles.link}
                      type={LinkType.page}
                      href={DOCS_CONNECT_LINKS.automationApi}
                      target={LinkTarget.blank}
                      color="accent"
                    />
                  ),
                  2: (
                    <Link
                      className={styles.link}
                      type={LinkType.page}
                      href={DOCS_CONNECT_LINKS.branding}
                      target={LinkTarget.blank}
                      color="accent"
                    />
                  ),
                }}
              />
            </Text>
            <Link
              className={styles.link}
              type={LinkType.page}
              href={DOCS_CONNECT_LINKS.apiDocs}
              target={LinkTarget.blank}
              color="accent"
              fontSize="13px"
              fontWeight={600}
            >
              {t("Common:ReadApiDocumentation")}
            </Link>
          </div>

          <Text as="p" className={styles.trialNote}>
            {t("DocsConnect:TrialAvailable")}
          </Text>
        </>
      )}

      <div className={styles.actions}>
        {canceled ? (
          <>
            <Button
              primary
              size={ButtonSize.small}
              label={t("Common:RenewSubscription")}
              onClick={() => openBuyPlan?.("edit")}
              isDisabled={!canManage}
              className={styles.buyButton}
              testId="docs_connect_buy_button"
            />
            <Link
              className={styles.link}
              type={LinkType.page}
              href={DOCS_CONNECT_LINKS.apiDocs}
              target={LinkTarget.blank}
              color="accent"
              fontSize="13px"
              fontWeight={600}
            >
              {t("Common:ReadApiDocumentation")}
            </Link>
          </>
        ) : (
          <Button
            primary
            size={ButtonSize.small}
            label={t("DocsConnect:StartFreeTrial")}
            onClick={onCreateTenant}
            isLoading={submitting}
            isDisabled={submitting || !canManage}
            testId="docs_connect_create_tenant_button"
          />
        )}
      </div>
    </div>
  );
};

export default inject(({ docsConnectStore, userStore }: TStore) => {
  const { user } = userStore;

  return {
    startTrial: docsConnectStore.startTrial,
    openBuyPlan: docsConnectStore.openBuyPlan,
    canManage: (user?.isAdmin || user?.isOwner) ?? false,
  };
})(observer(PromoPage));

