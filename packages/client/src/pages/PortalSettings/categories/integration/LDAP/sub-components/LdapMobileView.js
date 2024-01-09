import React, { useEffect } from "react";
import { Trans, withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MobileCategoryWrapper from "../../../../components/MobileCategoryWrapper";

const LdapMobileView = (props) => {
  const { t } = props;
  const navigate = useNavigate();

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  return (
    <div style={{ marginTop: "28px" }}>
      <MobileCategoryWrapper
        title={t("Ldap:LdapSettings")}
        subtitle={
          <Trans i18nKey="LdapMobileSettingsDescription" ns="Ldap" t={t} />
        }
        url="/portal-settings/integration/ldap/settings"
        onClickLink={onClickLink}
      />
      <MobileCategoryWrapper
        title={t("Ldap:LdapSyncTitle")}
        subtitle={<Trans i18nKey="LdapMobileSyncDescription" ns="Ldap" t={t} />}
        url="/portal-settings/integration/ldap/sync-data"
        onClickLink={onClickLink}
      />
    </div>
  );
};

export default withTranslation("Ldap")(LdapMobileView);
