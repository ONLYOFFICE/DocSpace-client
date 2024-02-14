import React, { useState } from "react";
import styled from "styled-components";

import SendClockReactSvg from "PUBLIC_DIR/images/send.clock.react.svg";
import CatalogSpamReactSvg from "PUBLIC_DIR/images/catalog.spam.react.svg";

import { IconSizeType, commonIconsStyles } from "../../utils";
import { Link, LinkType } from "../link";
import { Checkbox } from "../checkbox";

import { RowContent } from "./RowContent";
import { RowContentProps } from "./RowContent.types";

export default {
  title: "Components/RowContent",
  component: RowContent,
};

const SendClockIcon = styled(SendClockReactSvg)`
  ${commonIconsStyles}
`;
const CatalogSpamIcon = styled(CatalogSpamReactSvg)`
  ${commonIconsStyles}
`;

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
          <SendClockIcon size={IconSizeType.small} color="#3B72A7" />
          <CatalogSpamIcon size={IconSizeType.small} color="#3B72A7" />
        </>
        <Link type={LinkType.page} title="Demo" fontSize="12px" color="#A3A9AE">
          Demo
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo"
          fontSize="12px"
          color="#A3A9AE"
        >
          Demo
        </Link>
        <Link
          type={LinkType.page}
          title="0 000 0000000"
          fontSize="12px"
          color="#A3A9AE"
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.page}
          title="demo@demo.com"
          fontSize="12px"
          color="#A3A9AE"
        >
          demo@demo.com
        </Link>
      </RowContent>
      <RowContent>
        <Link type={LinkType.page} title="Demo Demo" isBold fontSize="15px">
          Demo Demo
        </Link>

        <CatalogSpamIcon size={IconSizeType.small} color="#3B72A7" />

        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo Demo"
          fontSize="12px"
          color="#A3A9AE"
        >
          Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color="#A3A9AE"
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo@demo.com"
          fontSize="12px"
          color="#A3A9AE"
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
          color="#A3A9AE"
        >
          Demo Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color="#A3A9AE"
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo.demo@demo.com"
          fontSize="12px"
          color="#A3A9AE"
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

        <SendClockIcon size={IconSizeType.small} color="#3B72A7" />

        <Link
          type={LinkType.action}
          title="Demo"
          fontSize="12px"
          color="#A3A9AE"
        >
          Demo
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="Demo Demo Demo Demo"
          fontSize="12px"
          color="#A3A9AE"
        >
          Demo Demo Demo Demo
        </Link>
        <Link
          type={LinkType.action}
          title="0 000 0000000"
          fontSize="12px"
          color="#A3A9AE"
        >
          0 000 0000000
        </Link>
        <Link
          // containerWidth="160px"
          type={LinkType.action}
          title="demo.demo.demo.demo@demo.com"
          fontSize="12px"
          color="#A3A9AE"
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
