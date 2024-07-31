/* eslint-disable @next/next/no-img-element */

import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";
import { deleteCookie, getCookie } from "@docspace/shared/utils/cookie";

import ArrowRightSvrUrl from "PUBLIC_DIR/images/arrow.right.react.svg?url";
import DefaultLogoUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";

import { ItemProps } from "../TenantList.types";

const Item = ({ portal, baseDomain }: ItemProps) => {
  const name = portal.portalName.includes(baseDomain)
    ? portal.portalName
    : `${portal.portalName}.${baseDomain}`;

  const onClick = () => {
    const redirectUrl = getCookie("x-redirect-authorization-uri")?.replace(
      window.location.origin,
      name,
    );
    deleteCookie("x-redirect-authorization-uri");

    window.open(`${portal.portalLink}&referenceUrl=${redirectUrl}`, "_self");
  };

  return (
    <div className="item" onClick={onClick}>
      <div className="info">
        <img className="favicon" alt="Portal favicon" src={DefaultLogoUrl} />
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
