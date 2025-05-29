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

import React, { useState } from "react";

import SendClockReactSvg from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamReactSvg from "PUBLIC_DIR/images/icons/16/catalog.spam.react.svg";

import { IconSizeType } from "../../../utils";
import { Link, LinkType } from "../../link";
import { Checkbox } from "../../checkbox";

import { RowContent } from ".";
import { RowContentProps } from "./RowContent.types";
import { globalColors } from "../../../themes";

import styles from "./RowContent.stories.module.scss";

export default {
  title: "Components/RowContent",
  component: RowContent,
};

const Template = (args: RowContentProps) => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <>
      <h3>Base demo</h3>
      <div style={{ height: "16px" }} />
      <RowContent {...args}>
        <Link type={LinkType.page} title="Demo" isBold fontSize="15px">
          Demo
        </Link>
        <>
          <SendClockReactSvg
            className={styles.sendClockIcon}
            data-size={IconSizeType.small}
            color={globalColors.lightIcons}
          />
          <CatalogSpamReactSvg
            className={styles.catalogSpamIcon}
            data-size={IconSizeType.small}
            color={globalColors.lightIcons}
          />
        </>
        <Link
          type={LinkType.page}
          title="Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo
        </Link>
        <Link
          type={LinkType.page}
          title="0 000 0000000"
          fontSize="12px"
          color={globalColors.gray}
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.page}
          title="demo@demo.com"
          fontSize="12px"
          color={globalColors.gray}
        >
          demo@demo.com
        </Link>
      </RowContent>
      <RowContent>
        <Link type={LinkType.page} title="Demo Demo" isBold fontSize="15px">
          Demo Demo
        </Link>

        <CatalogSpamReactSvg
          className={styles.catalogSpamIcon}
          data-size={IconSizeType.small}
          color={globalColors.lightIcons}
        />

        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color={globalColors.gray}
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo@demo.com"
          fontSize="12px"
          color={globalColors.gray}
        >
          demo.demo@demo.com
        </Link>
      </RowContent>
      <RowContent>
        <Link
          type={LinkType.action}
          title="Demo Demo Demo"
          isBold
          fontSize="15px"
        >
          Demo Demo Demo
        </Link>

        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo Demo Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color={globalColors.gray}
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo.demo@demo.com"
          fontSize="12px"
          color={globalColors.gray}
        >
          demo.demo.demo@demo.com
        </Link>
      </RowContent>
      <RowContent>
        <Link
          type={LinkType.action}
          title="Demo Demo Demo Demo"
          isBold
          fontSize="15px"
        >
          Demo Demo Demo Demo
        </Link>

        <SendClockReactSvg
          className={styles.sendClockIcon}
          data-size={IconSizeType.small}
          color={globalColors.lightIcons}
        />

        <Link
          type={LinkType.action}
          title="Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo Demo Demo Demo"
          fontSize="12px"
          color={globalColors.gray}
        >
          Demo Demo Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color={globalColors.gray}
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo.demo.demo@demo.com"
          fontSize="12px"
          color={globalColors.gray}
        >
          demo.demo.demo.demo@demo.com
        </Link>
      </RowContent>
      <div style={{ height: "36px" }} />
      <h3>Custom elements</h3>
      <div style={{ height: "16px" }} />
      <RowContent disableSideInfo>
        <Link type={LinkType.action} title="John Doe" isBold fontSize="15px">
          John Doe
        </Link>

        <Checkbox
          id="1"
          name="sample"
          isChecked={isChecked}
          onChange={() => {
            setIsChecked(!isChecked);
          }}
        />
      </RowContent>
    </>
  );
};

export const basic = Template.bind({});
