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

import React, { useEffect, useReducer, useState } from "react";
import styled, { css } from "styled-components";
import { Meta, StoryObj } from "@storybook/react";

import MobileActionsDocumentReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import MobileActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import MobileActionsSpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import MobileActionsFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import MobileActionsRemoveReactSvgUrl from "PUBLIC_DIR/images/mobile.actions.remove.react.svg?url";
import MobileUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

import { MainButtonMobile } from "./MainButtonMobile";

// import MobileMainButtonDocs from "./MainButtonMobile.docs.mdx";

const meta = {
  title: "Components/MainButtonMobile",
  component: MainButtonMobile,
  tags: ["autodocs"],
  parameters: {
    docs: {
      // page: MobileMainButtonDocs,
    },
  },
} satisfies Meta<typeof MainButtonMobile>;
type Story = StoryObj<typeof meta>;

export default meta;

const StyledWrapper = styled.div<{ isAutoDocs: boolean; isMobile?: boolean }>`
  width: 500px;
  height: 600px;

  ${(props) =>
    props.isAutoDocs &&
    css`
      width: calc(100% + 40px);
      height: 500px;
      position: relative;
      margin-block: 0 -20px;
      margin-inline: -20px 0;
    `}
`;

const Template = ({ ...args }) => {
  const maxUploads = 10;
  const maxOperations = 7;

  const [isOpenUploads, setIsOpenUploads] = useState(false);
  const [isOpenOperations, setIsOpenOperations] = useState(false);

  const [isOpenButton, setIsOpenButton] = useState(false);
  const [opened, setOpened] = useState(null);

  const [isUploading, setIsUploading] = useState(false);

  const [initialState, setInitialState] = useState({
    uploads: 0,
    operations: 0,
  });
  const onUploadClick = () => {
    setInitialState({ uploads: 0, operations: 0 });
    setIsUploading(true);
    setIsOpenUploads(true);
    setIsOpenOperations(true);
    setIsOpenButton(true);
  };

  function reducer(
    state: { uploads: number; operations: number },
    action: { type: string },
  ) {
    switch (action.type) {
      case "start":
        if (
          state.uploads === maxUploads &&
          state.operations === maxOperations
        ) {
          setIsUploading(false);
          return {
            ...state,
            uploads: state.uploads,
            operations: state.operations,
          };
        }
        return {
          ...state,
          uploads:
            state.uploads !== maxUploads ? state.uploads + 1 : state.uploads,
          operations:
            state.operations !== maxOperations
              ? state.operations + 1
              : state.operations,
        };
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    setOpened(null);
    if (isUploading) {
      const id = setInterval(() => {
        dispatch({ type: "start" });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [dispatch, isUploading]);

  const uploadPercent = (state.uploads / maxUploads) * 100;
  const operationPercent = (state.operations / maxOperations) * 100;

  const progressOptions = [
    {
      key: "1",
      label: "Uploads",
      icon: MobileActionsRemoveReactSvgUrl,
      percent: uploadPercent,
      status: `${state.uploads}/${maxUploads}`,
      open: isOpenUploads,
      onCancel: () => setIsOpenUploads(false),
    },
    {
      key: "2",
      label: "Other operations",
      icon: MobileActionsRemoveReactSvgUrl,
      percent: operationPercent,
      status: `3 files not loaded`,
      open: isOpenOperations,
      onCancel: () => setIsOpenOperations(false),
      error: true,
    },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1245);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1025);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isAutoDocs =
    typeof window !== "undefined" && window?.location?.href.includes("docs");

  const actionOptions = [
    {
      key: "1",
      label: "New document",
      icon: MobileActionsDocumentReactSvgUrl,
    },
    {
      key: "2",
      label: "New presentation",
      icon: MobileActionsPresentationReactSvgUrl,
    },
    {
      key: "3",
      label: "New spreadsheet",
      icon: MobileActionsSpreadsheetReactSvgUrl,
    },
    {
      key: "4",
      label: "New folder",
      icon: MobileActionsFolderReactSvgUrl,
    },
  ];

  const buttonOptions = [
    {
      key: "1",
      label: "Import point",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
    {
      key: "2",
      label: "Import point",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
    {
      key: "3",
      label: "Import point",
      isSeparator: true,
    },
    {
      key: "4",
      label: "Import point",
      icon: MobileUploadReactSvgUrl,
      onClick: () => setIsOpenButton(false),
    },
  ];
  return (
    <StyledWrapper isAutoDocs={isAutoDocs} isMobile={isMobile}>
      <MainButtonMobile
        {...args}
        style={{
          position: "absolute",
          bottom: "26px",
          insetInlineEnd: "44px",
        }}
        actionOptions={actionOptions}
        dropdownStyle={{
          position: "absolute",
          bottom: "25px",
          insetInlineEnd: "60px",
        }}
        progressOptions={progressOptions}
        buttonOptions={buttonOptions}
        onUploadClick={onUploadClick}
        withButton
        isOpenButton={isOpenButton}
        title="Upload"
        percent={uploadPercent}
        opened={opened || false}
      />
    </StyledWrapper>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    title: "Upload",
    percent: 0,
    opened: false,
  },
};
