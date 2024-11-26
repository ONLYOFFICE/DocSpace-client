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

            {value.read?.name && (
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
            )}
            {value.write?.name && (
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
            )}
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
            />
          </StyledScopesCheckbox>
          <StyledScopesCheckbox>
            {value.write?.name && (
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
              />
            )}
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
      {isRequiredError && (
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
      )}
      {list.map((item) => item)}
    </StyledScopesContainer>
  );
};

export default ScopesBlock;
