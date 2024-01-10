import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ModalDialog from "@docspace/components/modal-dialog";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import Scrollbar from "@docspace/components/scrollbar";
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
    --color-border-default: #d0d7de;
    --color-border-muted: hsla(210, 18%, 87%, 1);

    .modal-footer {
      padding-right: 4px;
    }

    a {
      color: #4781d1;
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
      <ModalDialog.Footer>
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
  personal: PropTypes.bool,
  buildVersionInfo: PropTypes.object,
};

export default inject(({ auth }) => {
  const { user } = auth.userStore;

  return {
    user,
  };
})(observer(DebugInfoDialog));
