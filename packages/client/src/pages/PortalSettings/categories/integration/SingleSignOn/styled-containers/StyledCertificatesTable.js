import styled from "styled-components";

const StyledCertificatesTable = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 12px;

  .header {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 40px;

    border-bottom: ${(props) =>
      props.theme.client.settings.integration.sso.border};

    &-cell:nth-child(n + 2) {
      display: flex;
      align-items: center;

      border-left: 1px solid #d0d5da;
      height: 13px;
      padding-left: 8px;
    }
  }

  .row {
    max-width: 520px;
    width: 100%;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 11px 0 10px;
    border-bottom: ${(props) =>
      props.theme.client.settings.integration.sso.border};

    .column {
      display: flex;
      flex-direction: column;
      width: 100%;

      .column-row {
        display: flex;
      }
    }

    .context-btn {
      justify-self: flex-end;
    }
  }
`;

export default StyledCertificatesTable;
