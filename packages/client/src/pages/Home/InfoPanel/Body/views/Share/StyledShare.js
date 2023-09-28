import styled from "styled-components";

const StyledLinks = styled.div`
  margin-top: 20px;

  .title-link {
    margin-bottom: 20px;
    color: #a3a9ae;
  }

  .additional-link {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    .link-to-viewing-icon {
      svg {
        weight: 16px;
        height: 16px;
      }
    }
  }
`;

const StyledLinkRow = styled.div`
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  align-items: center;

  .combo-button {
    padding-left: 8px;
  }

  .link-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-left: auto;
  }
`;

export { StyledLinks, StyledLinkRow };
