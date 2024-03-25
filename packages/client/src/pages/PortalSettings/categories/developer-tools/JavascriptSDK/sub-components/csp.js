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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TextInput } from "@docspace/shared/components/text-input";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import { tablet } from "@docspace/shared/utils";
import Base from "@docspace/shared/themes/base";

const CategoryHeader = styled.div`
  margin-top: 24px;
  margin-bottom: 16px;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

const Container = styled.div`
  margin-bottom: 4px;

  &.description-holder {
    display: block;
    color: ${(props) => props.theme.sdkPresets.secondaryColor};
    margin-bottom: 16px;
  }

  &.description-holder > div {
    display: inline-block;
    margin-inline-start: 4px;
    transform: translateY(1px);
  }

  &.input-holder {
    display: flex;
    align-items: center;
    gap: 8px;
    @media ${tablet} {
      margin-bottom: 8px;
    }
  }
`;

Container.defaultProps = { theme: Base };

const ChipsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px 4px;
  margin-top: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const CSP = ({ t, cspDomains, getCSPSettings, setCSPSettings }) => {
  useEffect(() => {
    getCSPSettings();
  }, []);

  const [domain, changeDomain] = useState("");
  const [error, setError] = useState(null);

  const onKeyPress = (e) => {
    if (e.key === "Enter" && !!domain.length) {
      addDomain();
    }
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const getChips = (domains) =>
    domains ? (
      domains.map((item, index) => (
        <SelectedItem
          key={`${item}-${index}`}
          isInline
          label={item}
          onClose={() => deleteDomain(item)}
          title={item}
        />
      ))
    ) : (
      <></>
    );

  const deleteDomain = (value) => {
    const domains = cspDomains.filter((item) => item !== value);

    if (error) setError(null);

    setCSPSettings({ domains, setDefaultIfEmpty: true });
  };

  const addDomain = async () => {
    const domainsSetting = [...cspDomains];
    const trimmedDomain = domain.trim();
    const domains = trimmedDomain.split(" ");

    domains.map((domain) => {
      if (domain === "" || domainsSetting.includes(domain)) return;

      domainsSetting.push(domain);
    });

    try {
      await setCSPSettings({ domains: domainsSetting });
    } catch (error) {
      setError(error?.response?.data?.error?.message);
    } finally {
      changeDomain("");
    }
  };

  const onChangeDomain = (e) => {
    if (error) setError(null);
    changeDomain(e.target.value);
  };

  return (
    <>
      <CategoryHeader>{t("CSPHeader")}</CategoryHeader>
      <Container className="description-holder">
        {t("CSPDescription")}
        <HelpButton
          className="csp-helpbutton"
          offsetRight={0}
          size={12}
          tooltipContent={<Text fontSize="12px">{t("CSPHelp")}</Text>}
        />
      </Container>
      <Container className="input-holder">
        <TextInput
          onChange={onChangeDomain}
          value={domain}
          placeholder={t("CSPInputPlaceholder")}
          tabIndex={1}
          hasError={error}
        />
        <SelectorAddButton isDisabled={!domain.trim()} onClick={addDomain} />
      </Container>
      <Text
        lineHeight="20px"
        color={error ? theme?.input.focusErrorBorderColor : "#A3A9AE"}
      >
        {error ? error : t("CSPUrlHelp")}
      </Text>
      <ChipsContainer>{getChips(cspDomains)}</ChipsContainer>
    </>
  );
};

export default inject(({ settingsStore }) => {
  const { cspDomains, getCSPSettings, setCSPSettings } = settingsStore;
  return { cspDomains, getCSPSettings, setCSPSettings };
})(observer(CSP));
