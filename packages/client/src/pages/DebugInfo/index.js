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

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import axios from "axios";
import styled from "styled-components";

const StyledModalDialog = styled(ModalDialog)`
  #modal-dialog {
    min-height: 560px;
    max-height: 560px;
    max-width: 733px;
    height: auto;
    width: auto;

    /* Light theme. */
    --color-border-default: ${(props) => props.theme.dialogs.borderColor};
    --color-border-muted: hsla(210, 18%, 87%, 1);

    .modal-footer {
      padding-inline-end: 4px;
    }

    a {
      color: ${(props) => props.theme.dialogs.linkColor};
    }

    .debug-info-body,
    .debug-info-footer {
      user-select: text;
    }
  }

  .markdown-wrapper {
    width: 100%;
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    display: block;
    margin-top: 0;
    margin-bottom: 16px;
    width: max-content;
    max-width: 100%;
    overflow: auto;
  }

  tr {
    border-top: 1px solid var(--color-border-muted);
  }

  td,
  th {
    padding: 6px 13px;
    border: 1px solid var(--color-border-default);
  }

  th {
    font-weight: 600;
  }

  table img {
    background-color: transparent;
  }
`;

const DebugInfoDialog = (props) => {
  const { visible, onClose, user } = props;
  const [md, setMd] = useState();

  useEffect(() => {
    if (md || !visible) return;

    async function loadMD() {
      try {
        const response = await axios.get("/debuginfo.md");
        setMd(response.data);
      } catch (e) {
        console.error(e);
        setMd(`Debug info load failed (${e.message})`);
      }
    }

    loadMD();
  }, [md, visible]);

  return (
    <StyledModalDialog
      withFooterBorder
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>Debug Info</ModalDialog.Header>
      <ModalDialog.Body className="debug-info-body">
        {/* <Text>{`# Build version: ${BUILD_VERSION}`}</Text> */}
        <Text>
          # Version: <span className="version">{VERSION}</span>
        </Text>
        <Text>{`# Build date: ${BUILD_AT}`}</Text>
        {user && (
          <Text>{`# Current User: ${user?.displayName} (id:${user?.id})`}</Text>
        )}
        <Text>{`# User Agent: ${navigator.userAgent}`}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer className="debug-info-footer">
        <Box
          className="markdown-wrapper"
          overflowProp="auto"
          heightProp={"362px"}
        >
          <Scrollbar>
            {md && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {md}
              </ReactMarkdown>
            )}
          </Scrollbar>
        </Box>
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

DebugInfoDialog.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  buildVersionInfo: PropTypes.object,
};

export default inject(({ userStore }) => {
  const { user } = userStore;

  return {
    user,
  };
})(observer(DebugInfoDialog));
