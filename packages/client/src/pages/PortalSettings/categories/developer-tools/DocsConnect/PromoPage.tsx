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

import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType, LinkTarget } from "@docspace/ui-kit/components/link";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";

import styles from "./PromoPage.module.scss";

const API_DOCS_URL = "https://api.onlyoffice.com/";
const CONNECTORS_URL = "#";
const EXAMPLES_URL = "#";

// Anchor for the "Automation API" hover tooltip.
const AUTOMATION_API_ANCHOR = "docs-connect-automation-api";

interface PromoPageProps {
  startTrial?: () => void;
}

const PromoPage = ({ startTrial }: PromoPageProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  const onReadApiDocs = () => window.open(API_DOCS_URL, "_blank");

  return (
    <div className={styles.promo}>
      <Heading level={HeadingLevel.h1} className={styles.title}>
        {t("DocsConnect:DocsConnect")}
      </Heading>

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
                href={CONNECTORS_URL}
                target={LinkTarget.blank}
                color="accent"
              />
            ),
            2: (
              <Link
                className={styles.link}
                id={AUTOMATION_API_ANCHOR}
                type={LinkType.action}
                color="accent"
              />
            ),
          }}
        />
      </Text>

      <Text as="p" className={styles.trialNote}>
        {t("DocsConnect:TrialAvailable")}
      </Text>

      <div className={styles.actions}>
        <Button
          primary
          size={ButtonSize.small}
          label={t("DocsConnect:CreateTenant")}
          onClick={() => startTrial?.()}
        />
        <Link
          className={styles.link}
          type={LinkType.action}
          color="accent"
          fontSize="13px"
          fontWeight={600}
          onClick={onReadApiDocs}
        >
          {t("DocsConnect:ReadApiDocumentation")}
        </Link>
      </div>

      <Tooltip
        anchorSelect={`#${AUTOMATION_API_ANCHOR}`}
        place="bottom-start"
        clickable
        maxWidth="280px"
      >
        <div className={styles.tooltipBox}>
          <Text fontSize="12px" lineHeight="16px">
            {t("DocsConnect:AutomationApiTooltip")}
          </Text>
          <Link
            type={LinkType.page}
            href={EXAMPLES_URL}
            target={LinkTarget.blank}
            color="accent"
            fontSize="13px"
            fontWeight={600}
            isHovered
          >
            {t("DocsConnect:CheckExamples")}
          </Link>
        </div>
      </Tooltip>
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  startTrial: docsConnectStore.startTrial,
}))(observer(PromoPage));

