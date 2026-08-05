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

import React, { useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { TextInput } from "@docspace/ui-kit/components/text-input";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import { SelectedItem } from "@docspace/ui-kit/components/selected-item";
import { InfoBar } from "@docspace/shared/components/info-bar";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { getBrandName } from "@docspace/shared/constants/brands";

import styles from "./csp.module.scss";

const CSP = ({
  cspDomains,
  currentColorScheme,
  installationGuidesUrl,
  setCSPSettings,
  standalone,
  t,
  theme,
  disableCSP,
  logoText,
}) => {
  const [domain, changeDomain] = useState("");
  const [error, setError] = useState(null);

  const addDomain = async () => {
    if (!domain.trim()) return;

    const domainSet = new Set(cspDomains);
    const initialSize = domainSet.size;

    const domainsToAdd = domain
      .trim()
      .split(/\s+/)
      .filter((newDomain) => newDomain && !domainSet.has(newDomain));

    domainsToAdd.forEach((newDomain) => domainSet.add(newDomain));

    if (domainSet.size > initialSize) {
      try {
        await setCSPSettings({ domains: Array.from(domainSet) });
        if (error) setError(null);
      } catch (err) {
        setError(
          err?.response?.data?.error?.message || t("Common:UnknownError"),
        );
      }
    }

    changeDomain("");
  };

  const deleteDomain = (value) => {
    const domains = cspDomains.filter((item) => item !== value);

    if (error) setError(null);

    setCSPSettings({ domains });
  };

  const getChips = (domains) =>
    domains
      ? domains.map((item) => (
          <SelectedItem
            key={item}
            isInline
            label={item}
            onClose={() => deleteDomain(item)}
            title={item}
            hideCross={disableCSP}
          />
        ))
      : null;

  const onChangeDomain = (e) => {
    if (error) setError(null);

    changeDomain(e.target.value);
  };

  const onAddByKey = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (!disableCSP && domain.trim().length > 0) {
          addDomain();
        }
      }
    },
    [domain, addDomain, disableCSP],
  );

  useEffect(() => {
    document.addEventListener("keyup", onAddByKey);
    return () => document.removeEventListener("keyup", onAddByKey);
  }, [onAddByKey]);

  return (
    <>
      <div className={styles.categoryHeader}>
        {t("CSPHeader", { productName: getBrandName("ProductName") })}
      </div>
      <div className={classNames(styles.container, styles.descriptionHolder)}>
        {t("CSPDescription", {
          productName: getBrandName("ProductName"),
          organizationName: logoText,
        })}
        <HelpButton
          className="csp-helpbutton"
          offsetRight={0}
          size={12}
          tooltipContent={<Text fontSize="12px">{t("CSPHelp")}</Text>}
        />
      </div>
      {standalone && window.location.protocol !== "https:" ? (
        <InfoBar
          title={t("CSPInfoBarHeader")}
          description={
            <>
              {t("CSPInfoBarDescription", {
                productName: getBrandName("ProductName"),
              })}{" "}
              {installationGuidesUrl ? (
                <Link
                  color={currentColorScheme?.main?.accent}
                  fontSize="13px"
                  fontWeight="400"
                  onClick={() => window.open(installationGuidesUrl, "_blank")}
                  dataTestId="csp_info_link"
                >
                  {t("Common:LearnMore")}
                </Link>
              ) : null}
            </>
          }
        />
      ) : null}
      <div className={classNames(styles.container, styles.inputHolder)}>
        <TextInput
          name="allowed_domain"
          onChange={onChangeDomain}
          value={domain}
          placeholder={t("CSPInputPlaceholder")}
          tabIndex={1}
          hasError={error}
          isDisabled={disableCSP}
          testId="allowed_domains_text_input"
        />
        <AddButton
          testId="allowed_domains_add_button"
          isDisabled={!domain.trim()}
          onClick={addDomain}
        />
      </div>
      <Text
        lineHeight="20px"
        color={error ? theme?.input.focusErrorBorderColor : globalColors.gray}
      >
        {error || t("CSPUrlHelp", { productName: getBrandName("ProductName") })}
      </Text>
      <div className={styles.chipsContainer}>{getChips(cspDomains)}</div>
    </>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const {
    cspDomains,
    currentColorScheme,
    installationGuidesUrl,
    setCSPSettings,
    standalone,
    logoText,
  } = settingsStore;

  const { user } = userStore;

  const disableCSP = user.isCollaborator || user.isRoomAdmin;

  return {
    cspDomains,
    currentColorScheme,
    installationGuidesUrl,
    setCSPSettings,
    standalone,
    disableCSP,
    logoText,
  };
})(observer(CSP));
