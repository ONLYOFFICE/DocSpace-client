import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const LoaderWrapper = styled.div`
  width: 100%;

  .display-block {
    display: block;
  }

  .mb-4 {
    margin-bottom: 4px;
  }

  .mb-5 {
    margin-bottom: 5px;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .mb-23 {
    margin-bottom: 23px;
  }

  .mb-24 {
    margin-bottom: 24px;
  }

  .mr-20 {
    margin-inline-end: 20px;
  }
`;

const DetailsWrapperLoader = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;
const DetailsItemWrapper = styled.div`
  padding: 16px;
  margin-inline-end: 40px;
  display: inline-block;
`;

export const WebhookDetailsLoader = () => {
  const DetailsItemLoader = () => (
    <DetailsItemWrapper>
      <RectangleSkeleton
        width="37px"
        height="16px"
        className="mb-5 display-block"
      />
      <RectangleSkeleton width="180px" height="20px" />
    </DetailsItemWrapper>
  );

  const MessageHeader = () => (
    <RectangleSkeleton width="130px" height="20px" className="mb-4" />
  );

  return (
    <LoaderWrapper>
      <DetailsWrapperLoader>
        <RectangleSkeleton
          width="80px"
          height="20px"
          className="mb-24 display-block"
        />
        <DetailsItemLoader />
        <DetailsItemLoader />
        <DetailsItemLoader />
        <DetailsItemLoader />
      </DetailsWrapperLoader>
      <div className=" mb-23">
        <RectangleSkeleton width="43px" height="32px" className="mr-20" />
        <RectangleSkeleton width="64px" height="32px" />
      </div>

      <MessageHeader />
      <RectangleSkeleton width="100%" height="212px" className="mb-16" />

      <MessageHeader />
      <RectangleSkeleton width="100%" height="469px" />
    </LoaderWrapper>
  );
};
