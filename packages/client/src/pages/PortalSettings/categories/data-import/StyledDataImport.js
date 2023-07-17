import styled from "styled-components";

const StyledWrapper = styled.div`
  max-width: 700px;

  .data-import-description {
    color: #657077;
    margin-bottom: 20px;
  }

  .start-migration-text {
    margin-bottom: 20px;
  }

  .service-list {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .service-wrapper {
    border: 1px solid #d0d5da;
    border-radius: 6px;
    width: 340px;
    height: 64px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export { StyledWrapper };
