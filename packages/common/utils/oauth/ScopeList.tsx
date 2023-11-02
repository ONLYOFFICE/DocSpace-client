import React from "react";
import styled from "styled-components";

//@ts-ignore
import { Base } from "@docspace/components/themes";

import { IFilteredScopes, IScope } from "./interfaces";
import { filterScopeByGroup } from ".";
import { ScopeType } from "./enums";

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

    background-color: ${(props) => props.theme.mainText};
  }
`;

StyledScopeItem.defaultProps = { theme: Base };

interface IScopeListProps {
  selectedScopes: string[];
  scopes: IScope[];

  t: any;
}

const ScopeList = ({ selectedScopes, scopes, t }: IScopeListProps) => {
  const [renderedScopes, setRenderedScopes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const result = [];

    const filteredScopes: IFilteredScopes = filterScopeByGroup(
      selectedScopes,
      scopes
    );

    for (let key in filteredScopes) {
      if (filteredScopes[key].isChecked) {
        if (filteredScopes[key].checkedType === ScopeType.read) {
          //@ts-ignore
          result.push(filteredScopes[key].read.tKey || "");
        } else {
          //@ts-ignore
          result.push(filteredScopes[key].write.tKey || "");
        }
      }
    }

    setRenderedScopes([...result]);
  }, [selectedScopes, scopes]);

  return (
    <StyledScopeList className="scope-list">
      {renderedScopes.map((scope, index) => (
        <StyledScopeItem key={`${scope}-${index}`}>
          <div className="circle"></div>
          {t(`Common:${scope}`)}
        </StyledScopeItem>
      ))}
    </StyledScopeList>
  );
};

export default ScopeList;
