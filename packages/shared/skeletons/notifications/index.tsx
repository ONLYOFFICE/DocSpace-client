import React from "react";
import { RectangleSkeleton } from "../rectangle";
import { StyledComponent } from "./Notifications.styled";
import { NotificationsLoaderProps } from "./Notifications.types";

const NotificationsLoader = ({
  title,
  borderRadius,
  backgroundColor,
  foregroundColor,
  backgroundOpacity,
  foregroundOpacity,
  speed,
  count = 1,
}: NotificationsLoaderProps) => {
  const items = [];

  const contentItem = (
    <>
      <div>
        <RectangleSkeleton
          className="notifications_title-loader"
          title={title}
          width="100%"
          height="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
        <RectangleSkeleton
          className="notifications_content-loader"
          title={title}
          width="100%"
          height="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate
        />
      </div>
      <RectangleSkeleton
        className="notifications_content-loader"
        title={title}
        width="24px"
        height="16px"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate
      />
    </>
  );

  for (let i = 0; i < count; i += 1) {
    items.push(
      <StyledComponent key={`notification_loader_${i}`}>
        {contentItem}
      </StyledComponent>,
    );
  }
  return items;
};

export default NotificationsLoader;
