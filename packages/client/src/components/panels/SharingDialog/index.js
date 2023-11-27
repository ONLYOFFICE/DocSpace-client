import React, { useEffect } from "react";
import styled from "styled-components";
import { Provider as MobxProvider, inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { getShareFiles } from "@docspace/common/api/files";

import Backdrop from "@docspace/components/backdrop";
import Aside from "@docspace/components/aside";
import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

import SharingPanel from "../SharingPanel";
import Share from "SRC_DIR/pages/Home/InfoPanel/Body/views/Share";
import store from "client/store";

const { auth: authStore } = store;

const StyledWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .share-file_header {
    padding: 12px 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .share-file_heading {
      font-size: 21px;
      font-weight: 700;
      line-height: 28px;
    }
  }

  .share-file_body {
    padding: 16px;
  }

  .share-file_footer {
    margin-top: auto;
    padding: 16px;
    border-top: ${(props) => props.theme.filesPanels.sharing.borderBottom};
  }
`;

const SharingDialog = ({
  sharingObject,
  onCancel,
  setSelection,
  isVisible,
}) => {
  const { t } = useTranslation(["Files", "SharingPanel", "Common"]);

  useEffect(() => {
    setSelection([sharingObject]);
  }, []);

  return (
    <>
      <Backdrop
        onClick={onCancel}
        visible={isVisible}
        zIndex={310}
        isAside={true}
        withoutBackground={false}
        withoutBlur={false}
      />
      <Aside visible={isVisible} onClose={onCancel} withoutBodyScroll>
        <StyledWrapper>
          <div className="share-file_header">
            <Text className="share-file_heading">{t("Files:Share")}</Text>
          </div>
          <div className="share-file_body">
            <Share selection={sharingObject} />
          </div>
          <div className="share-file_footer">
            <Button
              size="normal"
              scale
              label={t("Common:CancelButton")}
              onClick={onCancel}
            />
          </div>
        </StyledWrapper>
      </Aside>
    </>
  );
};

const SharingDialogWrapper = inject(({ filesStore }) => {
  const { getShareUsers, setSelection } = filesStore;

  return {
    getShareUsers,
    setSelection,
  };
})(observer(SharingDialog));

class SharingModal extends React.Component {
  static getSharingSettings = (fileId) =>
    getShareFiles([+fileId], []).then((users) =>
      this.convertSharingUsers(users)
    );

  static convertSharingUsers = (users) =>
    Promise.resolve(SharingPanel.convertSharingUsers(users));

  componentDidMount() {
    authStore.init(true);
  }

  render() {
    return (
      <MobxProvider {...store}>
        <SharingDialogWrapper {...this.props} />
      </MobxProvider>
    );
  }
}

export default SharingModal;
