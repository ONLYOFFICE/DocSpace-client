"use client";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import Item from "./sub-components/Item";

import StyledTenantList from "./TenantList.styled";
import { TenantListProps } from "./TenantList.types";

const TenantList = ({ portals, clientId, baseDomain }: TenantListProps) => {
  const router = useRouter();
  const { t } = useTranslation(["TenantList"]);

  const goToLogin = () => {
    router.push(`/?type=oauth2&client_id=${clientId}`);
  };

  return (
    <StyledTenantList>
      <Text className="more-accounts">{t("MorePortals")}</Text>
      <div className="items-list">
        {portals.map((item) => (
          <Item portal={item} key={item.portalName} baseDomain={baseDomain} />
        ))}
      </div>
      <Button
        onClick={goToLogin}
        label={t("BackToSignIn")}
        className="back-button"
      />
    </StyledTenantList>
  );
};

export default TenantList;
