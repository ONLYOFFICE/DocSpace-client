import { useGesture } from "@use-gesture/react";
import { useSpring, animated } from "@react-spring/web";
import React, { useRef } from "react";
import styles from "./PluginViewer.module.scss";
import { PluginViewerProps } from "./PluginViewer.props";

export const PluginViewer = ({
  pluginViewerContent,
  handleMaskClick,
  onNext,
  onPrev,
  isFirstItem = false,
  isLastItem = false,
  devices,
}: PluginViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDesktop } = devices || { isDesktop: true };

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 1,
  }));

  useGesture(
    {
      onDragStart: () => {
        if (isDesktop) return;
      },
      onDrag: ({ offset: [dx, dy], movement: [mdx, mdy], memo, first }) => {
        if (isDesktop) return memo;

        let memoLet = memo;
        if (first) {
          memoLet = style.y.get();
        }

        api.start({
          x:
            (isFirstItem && mdx > 0) || (isLastItem && mdx < 0)
              ? style.x.get()
              : dx,
          y: dy >= memoLet ? dy : style.y.get(),
          opacity: mdy > 0 ? Math.max(1 - mdy / 120, 0) : style.opacity.get(),
          immediate: true,
        });

        return memoLet;
      },
      onDragEnd: ({ movement: [mdx, mdy] }) => {
        if (isDesktop) return;

        const threshold = window.innerWidth / 4;

        // Check if we should navigate
        const shouldGoNext = mdx < -threshold && !isLastItem;
        const shouldGoPrev = mdx > threshold && !isFirstItem;
        const shouldClose = mdy > 120;

        if (shouldClose) {
          handleMaskClick();
          return;
        }

        if (shouldGoNext || shouldGoPrev) {
          // Animate back to center before navigation
          api.start({
            x: 0,
            y: 0,
            opacity: 1,
            config: {
              duration: 100,
            },
            onRest: () => {
              if (shouldGoNext) onNext?.();
              else if (shouldGoPrev) onPrev?.();
            },
          });
        } else {
          api.start({
            x: 0,
            y: 0,
            opacity: 1,
          });
        }
      },
    },
    {
      drag: {
        from: () => [style.x.get(), style.y.get()],
        axis: "lock",
      },
      target: containerRef,
    },
  );

  const AnimatedDiv = animated("div");

  return (
    <div
      ref={containerRef}
      className={styles.pluginViewerWrapper}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          handleMaskClick();
        }
      }}
    >
      <AnimatedDiv style={style}>{pluginViewerContent}</AnimatedDiv>
    </div>
  );
};
