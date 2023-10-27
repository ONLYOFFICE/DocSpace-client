import React from "react";

import {
  IFilteredScopes,
  IScope,
} from "@docspace/common/utils/oauth/interfaces";
import {
  filterScopeByGroup,
  getScopeTKeyName,
} from "@docspace/common/utils/oauth";
import { ScopeGroup, ScopeType } from "@docspace/common/utils/oauth/enums";

import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";

import BlockHeader from "./BlockHeader";

import {
  StyledScopesCheckbox,
  StyledScopesContainer,
  StyledScopesName,
} from "../ClientForm.styled";

interface IScopesBlockProps {
  scopes: IScope[];
  selectedScopes: string[];
  onAddScope: (scope: string[]) => void;
  t: any;
}

const ScopesBlock = ({
  scopes,
  selectedScopes,
  onAddScope,
  t,
}: IScopesBlockProps) => {
  const [checkedScopes, setCheckedScopes] = React.useState<string[]>([]);
  const [filteredScopes, setFilteredScopes] = React.useState<IFilteredScopes>(
    filterScopeByGroup(selectedScopes, scopes)
  );

  React.useEffect(() => {
    const filtered = filterScopeByGroup(selectedScopes, scopes);

    setCheckedScopes([...selectedScopes]);
    setFilteredScopes({ ...filtered });
  }, []);

  const onAddCheckedScope = (
    group: ScopeGroup,
    type: ScopeType,
    name: string
  ) => {
    const isChecked = checkedScopes.includes(name);

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
          const isReadChecked = checkedScopes.includes(val[group].read.name);

          val[group].isChecked = isReadChecked;
          val[group].checkedType = isReadChecked ? ScopeType.read : undefined;

          return { ...val };
        });
      }

      setCheckedScopes((val) => val.filter((v) => v !== name));
    }
  };

  const getRenderedScopeList = () => {
    const list = [];

    for (let key in filteredScopes) {
      const name = getScopeTKeyName(key as ScopeGroup);

      const scope = filteredScopes[key];

      const isReadDisabled = scope.checkedType === ScopeType.write;
      const isReadChecked = scope.isChecked;

      const row = (
        <React.Fragment key={name}>
          <StyledScopesName>
            {/* @ts-ignore */}
            <Text
              className="scope-name"
              fontSize={"14px"}
              fontWeight={600}
              lineHeight={"16px"}
            >
              {t(`${name}`)}
            </Text>
            {/* @ts-ignore */}
            <Text
              className={"scope-desc"}
              fontSize={"12px"}
              fontWeight={400}
              lineHeight={"16px"}
            >
              {/* @ts-ignore */}
              <Text
                className={"scope-desc"}
                as={"span"}
                fontSize={"12px"}
                fontWeight={600}
                lineHeight={"16px"}
              >
                {scope.read.name}
              </Text>{" "}
              — {t(`${scope.read.tKey}`)}
            </Text>
            {/* @ts-ignore */}
            <Text
              className={"scope-desc"}
              fontSize={"12px"}
              fontWeight={400}
              lineHeight={"16px"}
            >
              {/* @ts-ignore */}
              <Text
                className={"scope-desc"}
                as={"span"}
                fontSize={"12px"}
                fontWeight={600}
                lineHeight={"16px"}
              >
                {scope.write.name}
              </Text>
              — {t(`${scope.write.tKey}`)}
            </Text>
          </StyledScopesName>
          <StyledScopesCheckbox>
            <Checkbox
              className="checkbox-read"
              isChecked={isReadChecked}
              isDisabled={isReadDisabled}
              onChange={() =>
                onAddCheckedScope(
                  key as ScopeGroup,
                  ScopeType.read,
                  scope.read.name
                )
              }
            />
          </StyledScopesCheckbox>
          <StyledScopesCheckbox>
            <Checkbox
              isChecked={isReadDisabled}
              onChange={() =>
                onAddCheckedScope(
                  key as ScopeGroup,
                  ScopeType.write,
                  scope.write.name
                )
              }
            />
          </StyledScopesCheckbox>
        </React.Fragment>
      );

      list.push(row);
    }
    return list;
  };

  const list = getRenderedScopeList();

  return (
    <StyledScopesContainer>
      <BlockHeader
        className="header"
        header={"Access scopes"}
        helpButtonText="Access scopes help"
      />
      {/* @ts-ignore */}
      <Text
        className="header"
        fontSize={"14px"}
        fontWeight={600}
        lineHeight={"22px"}
      >
        Read
      </Text>
      {/* @ts-ignore */}
      <Text
        className="header header-last"
        fontSize={"14px"}
        fontWeight={600}
        lineHeight={"22px"}
      >
        Write
      </Text>
      {list.map((item) => item)}
    </StyledScopesContainer>
  );
};

export default ScopesBlock;
