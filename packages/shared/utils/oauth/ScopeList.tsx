import React from "react";
import styled from "styled-components";

import { Base } from "../../themes";
import { ScopeType } from "../../enums";
import { TTranslation } from "../../types";

import { IFilteredScopes, IScope } from "./interfaces";
import { filterScopeByGroup } from ".";

const StyledScopeList = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  gap: 4px;
`;

const StyledScopeItem = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  gap: 8px;

  font-size: 13px;
  font-weight: 400;
  line-height: 20px;

  .circle {
    width: 4px;
    height: 4px;

    border-radius: 50%;

    background: ${(props) => props.theme.color};
  }
`;

StyledScopeItem.defaultProps = { theme: Base };

interface IScopeListProps {
  selectedScopes: string[];
  scopes: IScope[];

  t: TTranslation;
}

const ScopeList = ({ selectedScopes, scopes, t }: IScopeListProps) => {
  const [renderedScopes, setRenderedScopes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const result: string[] = [];

    const filteredScopes: IFilteredScopes = filterScopeByGroup(
      selectedScopes,
      scopes,
    );

    Object.keys(filteredScopes).forEach((key) => {
      if (filteredScopes[key].isChecked) {
        if (
          filteredScopes[key].checkedType === ScopeType.read ||
          filteredScopes[key].checkedType === ScopeType.openid
        ) {
          result.push(filteredScopes[key].read?.tKey || "");
        } else {
          result.push(filteredScopes[key].write?.tKey || "");
        }
      }
    });

    setRenderedScopes([...result]);
  }, [selectedScopes, scopes]);

  return (
    <StyledScopeList className="scope-list">
      {renderedScopes.map((scope) => (
        <StyledScopeItem key={`${scope}`}>
          <div className="circle" />
          {t(`Common:${scope}`)}
        </StyledScopeItem>
      ))}
    </StyledScopeList>
  );
};

export default ScopeList;
