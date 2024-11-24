import React from "react";
import styled from "styled-components";

import { Base } from "../../themes";
import { ScopeType } from "../../enums";
import { TTranslation } from "../../types";

import { TFilteredScopes, TScope } from "./types";
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

interface TScopeListProps {
  selectedScopes: string[];
  scopes: TScope[];

  t: TTranslation;
}

const getRenderedScopes = ({ selectedScopes, scopes, t }: TScopeListProps) => {
  const result: string[] = [];

  const filteredScopes: TFilteredScopes = filterScopeByGroup(
    selectedScopes,
    scopes,
    t,
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

  return result;
};

const ScopeList = ({ selectedScopes, scopes, t }: TScopeListProps) => {
  const [renderedScopes, setRenderedScopes] = React.useState<string[]>(
    getRenderedScopes({ selectedScopes, scopes, t }),
  );

  React.useEffect(() => {
    const result = getRenderedScopes({ selectedScopes, scopes, t });

    setRenderedScopes([...result]);
  }, [selectedScopes, scopes, t]);

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
