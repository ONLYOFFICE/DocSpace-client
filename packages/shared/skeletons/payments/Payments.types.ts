import type { RectangleSkeletonProps } from "../rectangle";

export interface PaymentsLoaderProps extends RectangleSkeletonProps {}

export interface PaymentsStandaloneLoaderProps extends RectangleSkeletonProps {
  isEnterprise?: boolean;
}
