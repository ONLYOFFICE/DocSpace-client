"use client";

import { Text } from "@docspace/shared/components/text";

import Item from "./sub-components/Item";

import StyledTenantList from "./TenantList.styled";
import { TenantListProps } from "./TenantList.types";
import { Button } from "@docspace/shared/components/button";
import { useRouter } from "next/navigation";

const TenantList = ({ portals, clientId, baseDomain }: TenantListProps) => {
  const router = useRouter();

  const goToLogin = () => {
    router.push(`/?type=oauth2&client_id=${clientId}`);
  };

  return (
    <StyledTenantList>
      <Text className="more-accounts">
        You have more than one accounts. Please choose one of them
      </Text>
      <div className="items-list">
        {portals.map((item) => (
          <Item
            portal={item}
            key={item.portalName}
            clientId={clientId}
            baseDomain={baseDomain}
          />
        ))}
      </div>
      <Button
        onClick={goToLogin}
        label="Back to sign in"
        className="back-button"
      />
    </StyledTenantList>
  );
};

export default TenantList;
