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
import classNames from "classnames";

import { ScopeType } from "../../../enums";
import { TTranslation } from "../../../types";

import { TFilteredScopes, TScope } from "../types";
import { filterScopeByGroup } from "../index";
import styles from "./ScopeList.module.scss";

export interface TScopeListProps {
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

export const ScopeList = ({ selectedScopes, scopes, t }: TScopeListProps) => {
  const [renderedScopes, setRenderedScopes] = React.useState<string[]>(
    getRenderedScopes({ selectedScopes, scopes, t }),
  );

  React.useEffect(() => {
    const result = getRenderedScopes({ selectedScopes, scopes, t });

    setRenderedScopes([...result]);
  }, [selectedScopes, scopes, t]);

  return (
    <div
      data-testid="scope-list"
      className={classNames(styles.scopeList, "scope-list")}
    >
      {renderedScopes.map((scope) => (
        <div className={styles.scopeItem} key={`${scope}`}>
          <div className={styles.circle} />
          {scope}
        </div>
      ))}
    </div>
  );
};
