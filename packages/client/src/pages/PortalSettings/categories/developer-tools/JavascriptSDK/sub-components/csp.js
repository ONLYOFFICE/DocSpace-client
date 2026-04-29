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
