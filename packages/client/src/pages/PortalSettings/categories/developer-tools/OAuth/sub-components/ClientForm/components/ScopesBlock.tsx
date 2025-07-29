// (c) Copyright Ascensio System SIA 2009-2025
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
import { useTheme } from "styled-components";

import {
  IClientReqDTO,
  TFilteredScopes,
  TScope,
} from "@docspace/shared/utils/oauth/types";
import {
  filterScopeByGroup,
  getScopeTKeyName,
} from "@docspace/shared/utils/oauth";
import { ScopeGroup, ScopeType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { globalColors } from "@docspace/shared/themes";

import BlockHeader from "./BlockHeader";

import {
  StyledScopesCheckbox,
  StyledScopesContainer,
  StyledScopesName,
} from "../ClientForm.styled";

interface TScopesBlockProps {
  scopes: TScope[];
  selectedScopes: string[];
  onAddScope: (name: keyof IClientReqDTO, scope: string) => void;
  t: TTranslation;
  isEdit: boolean;
  requiredErrorFields: string[];
}

const ScopesBlock = ({
  scopes,
  selectedScopes,
  onAddScope,
  t,
  isEdit,
  requiredErrorFields,
}: TScopesBlockProps) => {
  const [checkedScopes, setCheckedScopes] = React.useState<string[]>([]);
  const [filteredScopes, setFilteredScopes] = React.useState<TFilteredScopes>(
    filterScopeByGroup(selectedScopes, scopes, t),
  );

  React.useEffect(() => {
    const filtered = filterScopeByGroup(selectedScopes, scopes, t);

    setCheckedScopes([...selectedScopes]);
    setFilteredScopes({ ...filtered });
  }, [scopes, selectedScopes, t]);

  const onAddCheckedScope = (
    group: ScopeGroup,
    type: ScopeType,
    name: string = "",
  ) => {
    const isChecked = checkedScopes.includes(name);

    const isWrite = type === "write";

    if (!isChecked) {
      setFilteredScopes((val) => {
        val[group].isChecked = true;
        val[group].checkedType = type;

        return { ...val };
      });
      setCheckedScopes((val) => [...val, name]);
    } else {
      if (type === ScopeType.read) {
        setFilteredScopes((val) => {
          val[group].isChecked = false;
          val[group].checkedType = undefined;

          return { ...val };
        });
      } else {
        setFilteredScopes((val) => {
          const isReadChecked = checkedScopes.includes(
            val[group].read?.name || "",
          );

          val[group].isChecked = isReadChecked;
          val[group].checkedType = isReadChecked ? ScopeType.read : undefined;

          return { ...val };
        });
      }

      setCheckedScopes((val) => val.filter((v) => v !== name));
    }

    if (isWrite) onAddScope("scopes", name.replace("write", "read"));

    onAddScope("scopes", name);
  };

  const getRenderedScopeList = () => {
    const list: React.ReactNode[] = [];

    Object.entries(filteredScopes).forEach(([key, value]) => {
      const name = getScopeTKeyName(key as ScopeGroup, t);

      const isReadDisabled = value.checkedType === ScopeType.write;
      const isReadChecked = value.isChecked;

      const row = (
        <React.Fragment key={name}>
          <StyledScopesName>
            <Text
              className="scope-name"
              fontSize="14px"
              fontWeight={600}
              lineHeight="16px"
            >
              {t(`Common:${name}`)}
            </Text>

            {value.read?.name ? (
              <Text
                className="scope-desc"
                fontSize="12px"
                fontWeight={400}
                lineHeight="16px"
              >
                <Text
                  className="scope-desc"
                  as="span"
                  fontSize="12px"
                  fontWeight={600}
                  lineHeight="16px"
                >
                  {value.read?.name}
                </Text>{" "}
                — {t(`Common:${value.read?.tKey}`)}
              </Text>
            ) : null}
            {value.write?.name ? (
              <Text
                className="scope-desc"
                fontSize="12px"
                fontWeight={400}
                lineHeight="16px"
              >
                <Text
                  className="scope-desc"
                  as="span"
                  fontSize="12px"
                  fontWeight={600}
                  lineHeight="16px"
                >
                  {value.write?.name}
                </Text>{" "}
                — {t(`Common:${value.write?.tKey}`)}
              </Text>
            ) : null}
          </StyledScopesName>
          <StyledScopesCheckbox>
            <Checkbox
              className="checkbox-read"
              isChecked={isReadChecked}
              isDisabled={isReadDisabled || isEdit}
              onChange={() =>
                onAddCheckedScope(
                  key as ScopeGroup,
                  ScopeType.read,
                  value.read?.name,
                )
              }
              testId="scope_read_checkbox"
            />
          </StyledScopesCheckbox>
          <StyledScopesCheckbox>
            {value.write?.name ? (
              <Checkbox
                isChecked={isReadDisabled}
                isDisabled={isEdit || !value.write?.name}
                onChange={() =>
                  onAddCheckedScope(
                    key as ScopeGroup,
                    ScopeType.write,
                    value.write?.name,
                  )
                }
                testId="scope_write_checkbox"
              />
            ) : null}
          </StyledScopesCheckbox>
        </React.Fragment>
      );

      list.push(row);
    });

    return list;
  };

  const list = getRenderedScopeList();

  const theme = useTheme();

  const isRequiredError = requiredErrorFields.includes("scopes");

  return (
    <StyledScopesContainer isRequiredError={isRequiredError}>
      <BlockHeader
        className="header"
        header={t("ScopesHeader")}
        helpButtonText={t("ScopesHelp")}
        isRequired
      />

      <Text
        className="header"
        fontSize="14px"
        fontWeight={600}
        lineHeight="22px"
      >
        {t("Read")}
      </Text>

      <Text
        className="header header-last"
        fontSize="14px"
        fontWeight={600}
        lineHeight="22px"
      >
        {t("Write")}
      </Text>
      {isRequiredError ? (
        <>
          <Text
            className="header-error"
            fontWeight={400}
            fontSize="12px"
            lineHeight="16px"
            color={
              theme.isBase
                ? globalColors.lightErrorStatus
                : globalColors.darkErrorStatus
            }
          >
            {t("Common:SectionRequired")}
          </Text>
          <span />
          <span />
        </>
      ) : null}
      {list.map((item) => item)}
    </StyledScopesContainer>
  );
};

export default ScopesBlock;
