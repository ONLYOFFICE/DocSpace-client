import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const LoaderWrapper = styled.div`
  width: 100%;
`;

const NavContainerLoader = styled.nav`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 17px;
`;

const HistoryHeaderLoader = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 27px;
`;

const HistoryRowWrapper = styled.div`
  margin-bottom: 27px;

  .historyIconLoader {
    display: inline-block;
    margin-inline-end: 16px;
  }

  .historyContentLoader {
    display: inline-block;
    width: calc(100% - 36px);
  }
`;

export const WebhookHistoryLoader = () => {
  const HistoryRowLoader = () => (
    <HistoryRowWrapper>
      <RectangleSkeleton
        width="20px"
        height="20px"
        className="historyIconLoader"
      />
      <RectangleSkeleton height="20px" className="historyContentLoader" />
    </HistoryRowWrapper>
  );

  return (
    <LoaderWrapper>
      <NavContainerLoader>
        <RectangleSkeleton width="118px" height="22px" />
        <RectangleSkeleton width="32px" height="22px" />
      </NavContainerLoader>

      <HistoryHeaderLoader>
        <RectangleSkeleton width="51px" height="16px" />
        <RectangleSkeleton width="60px" height="16px" />
        <RectangleSkeleton width="60px" height="16px" />
        <RectangleSkeleton width="62px" height="16px" />
        <RectangleSkeleton width="16px" height="16px" />
      </HistoryHeaderLoader>

      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
      <HistoryRowLoader />
    </LoaderWrapper>
  );
};
