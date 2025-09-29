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

import { Link } from "@docspace/shared/components/link";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { useState, useRef, useEffect } from "react";
import { observer, inject } from "mobx-react";
import { Trans, withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";
import FilesSelector from "SRC_DIR/components/FilesSelector";
import { toastr } from "@docspace/shared/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import * as Styled from "./index.styled";

const SubmitToFormGallery = ({
  t,
  visible,
  setVisible,
  formItem,
  setFormItem,
  getIcon,
  currentColorScheme,
  canSubmitToFormGallery,
  submitToFormGallery,
  fetchGuideLink,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guideLink, setGuideLink] = useState(null);

  const abortControllerRef = useRef(new AbortController());

  let formItemIsSet = !!formItem;

  const [isSelectingForm, setIsSelectingForm] = useState(false);

  const onClose = () => {
    abortControllerRef.current?.abort();
    setIsSubmitting(false);
    setFormItem(null);
    setIsSelectingForm(false);
    setVisible(false);
  };

  const onError = (err) => {
    if (!err.message === "canceled") {
      console.error(err);
      toastr.error(err);
    }
    onClose();
  };

  const onOpenFormSelector = () => setIsSelectingForm(true);
  const onCloseFormSelector = () => {
    if (!formItemIsSet) onClose();
    else setIsSelectingForm(false);
  };

  const onSelectForm = (data) => {
    formItemIsSet = true;
    setFormItem(data);
  };

  const onSubmitToGallery = async () => {
    if (!formItem) return;

    setIsSubmitting(true);

    const origin = combineUrl(window.ClientConfig?.proxy?.url);

    const fileSrc = `${origin}/filehandler.ashx?action=download&fileid=${formItem.id}`;

    const file = await fetch(fileSrc)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.arrayBuffer();
      })
      .then(async (arrayBuffer) => {
        return new File([arrayBuffer], formItem.title, {
          type: "application/octet-stream",
        });
      })
      .catch((err) => onError(err));

    await submitToFormGallery(
      file,
      formItem.title,
      "en",
      abortControllerRef.current?.signal,
    )
      .then((res) => {
        if (!res.data) throw new Error(res.statusText);
        window.location.replace(res.data);
      })
      .catch((err) => onError(err))
      .finally(() => onClose());
  };

  useEffect(() => {
    (async () => {
      const fetchedGuideLink = await fetchGuideLink();
      setGuideLink(fetchedGuideLink);
    })();
  }, []);

  if (!canSubmitToFormGallery()) return null;

  if (isSelectingForm)
    return (
      <FilesSelector
        key="select-file-dialog"
        filterParam="TemplateGalleryTypes"
        isPanelVisible
        onSelectFile={onSelectForm}
        onClose={onCloseFormSelector}
        withRecentTreeFolder
        withFavoritesTreeFolder
        isPortalView
        withoutDescriptionText
      />
    );

  console.log(formItem);

  return (
    <ModalDialog visible={visible} onClose={onClose} autoMaxHeight>
      <ModalDialog.Header>
        {t("Common:SubmitToTemplateGallery")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div>{t("FormGallery:SubmitToGalleryDialogMainInfo")}</div>
        <div>
          <Trans
            t={t}
            i18nKey="SubmitToGalleryDialogGuideInfo"
            ns="FormGallery"
          >
            Learn how to create perfect templates and increase your chance to
            get approval in our
            <Link
              color={currentColorScheme.main?.accent}
              href={guideLink || "#"}
              type="page"
              target="_blank"
              isBold
              isHovered
              dataTestId="submit_to_gallery_guide_link"
            >
              guide
            </Link>
            .
          </Trans>
        </div>

        {formItem ? (
          <Styled.FormItem>
            <ReactSVG className="icon" src={getIcon(32, formItem.fileExst)} />
            <div className="item-title">
              {formItem?.title ? (
                [
                  <span className="name" key="name">
                    {formItem.title}
                  </span>,
                  formItem.fileExst && (
                    <span className="exst" key="exst">
                      {formItem.fileExst}
                    </span>
                  ),
                ]
              ) : (
                <span className="name">{`${formItem.fileExst}`}</span>
              )}
            </div>
          </Styled.FormItem>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {!formItem ? (
          <Button
            primary
            size="normal"
            label={t("FormGallery:SelectTemplate")}
            onClick={onOpenFormSelector}
            scale
            testId="submit_to_gallery_select_form_button"
          />
        ) : (
          <Button
            primary
            size="normal"
            label={t("Common:SubmitToGallery")}
            onClick={onSubmitToGallery}
            isLoading={isSubmitting}
            scale
            testId="submit_to_gallery_apply_button"
          />
        )}
        <Button
          size="normal"
          label={t("Common:CancelButton")}
          onClick={onClose}
          scale
          testId="submit_to_gallery_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    accessRightsStore,
    dialogsStore,
    settingsStore,
    filesSettingsStore,
    oformsStore,
  }) => ({
    visible: dialogsStore.submitToGalleryDialogVisible,
    setVisible: dialogsStore.setSubmitToGalleryDialogVisible,
    formItem: dialogsStore.formItem,
    setFormItem: dialogsStore.setFormItem,
    getIcon: filesSettingsStore.getIcon,
    currentColorScheme: settingsStore.currentColorScheme,
    canSubmitToFormGallery: accessRightsStore.canSubmitToFormGallery,
    submitToFormGallery: oformsStore.submitToFormGallery,
    fetchGuideLink: oformsStore.fetchGuideLink,
  }),
)(withTranslation("Common", "FormGallery")(observer(SubmitToFormGallery)));
