/* eslint-disable @next/next/no-img-element */

import { Text } from "@docspace/shared/components/text";

import ArrowRightSvrUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";

import { ItemProps } from "../TenantList.types";
import { IconButton } from "@docspace/shared/components/icon-button";
import { generateOAuth2ReferenceURl } from "@/utils";

const Item = ({ clientId, portal, baseDomain }: ItemProps) => {
  console.log(portal);
  const name = portal.portalName.includes(baseDomain)
    ? portal.portalName
    : `${portal.portalName}.${baseDomain}`;

  const onClick = () => {
    const referenceUrl = generateOAuth2ReferenceURl(clientId);

    window.open(`${portal.portalLink}&referenceUrl=${referenceUrl}`, "_self");
  };

  return (
    <div className="item" onClick={onClick}>
      <div className="info">
        <img
          className="favicon"
          alt="Portal favicon"
          src={`${name}/logo.ashx?logotype=3`}
        />
        <Text fontWeight={600} fontSize="14px" lineHeight="16px" truncate>
          {name.replace("http://", "").replace("https://", "")}
        </Text>
      </div>
      <IconButton
        iconName={ArrowRightSvrUrl}
        size={16}
        className="icon-button"
      />
    </div>
  );
};

export default Item;
