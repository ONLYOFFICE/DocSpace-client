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
import { Link as LinkRouter } from "react-router";

import { classNames } from "../../../utils";
import { Link, LinkType } from "../../link";
import { Button, ButtonSize } from "../../button";

import { EmptyViewItem } from "./EmptyView.item";
import { isEmptyButtonOption, isEmptyLinkOptions } from "../EmptyView.utils";
import styles from "../EmptyView.module.scss";

import type { EmptyViewOptionProps } from "../EmptyView.types";

const EmptyViewOption = ({ option }: EmptyViewOptionProps) => {
  if (isEmptyLinkOptions(option)) {
    if (option.isNext)
      return (
        <Link
          type={LinkType.action}
          id={option.key.toString()}
          className={classNames(styles.link, option.className)}
          onClick={(e) =>
            option.onClick?.(e as React.MouseEvent<HTMLAnchorElement>)
          }
        >
          {option.icon}
          <span>{option.description}</span>
        </Link>
      );
    return (
      <LinkRouter
        id={option.key.toString()}
        className={classNames(styles.link, option.className)}
        to={option.to}
        state={option.state}
        onClick={option.onClick}
      >
        {option.icon}
        <span>{option.description}</span>
      </LinkRouter>
    );
  }

  if (isEmptyButtonOption(option)) {
    return (
      <Button
        className={classNames(styles.button, option.className)}
        id={option.key.toString()}
        onClick={option.onClick}
        label={option.title}
        primary
        size={ButtonSize.small}
      />
    );
  }

  const { key, ...other } = option;
  return <EmptyViewItem id={key.toString()} {...other} />;
};

export default EmptyViewOption;
