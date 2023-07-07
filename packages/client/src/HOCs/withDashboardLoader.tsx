import Loaders from "@docspace/common/components/Loaders";
import DashboardProps from "SRC_DIR/pages/Home/Dashboard/Dashboard.props";

interface WithDashboardLoaderProps {
  viewAs: "row" | "table" | "dashboard";
  isLoading: boolean;
}
export default function withDashboardLoader<T extends DashboardProps>(
  Component: React.ComponentType<T>
) {
  const displayName = Component.displayName || Component.name || "Dashboard";

  const ComponentWithDashboardLoader = (
    props: T & WithDashboardLoaderProps
  ) => {
    const { viewAs, isLoading } = props;

    if (isLoading) {
      switch (viewAs) {
        case "row":
          return <Loaders.Rows />;
        case "table":
          return <Loaders.Rows />;
        case "dashboard":
          return <Loaders.DashboardLoader />;
        default:
          return <Component {...(props as T)} />;
      }
    }

    return <Component {...(props as T)} />;
  };

  ComponentWithDashboardLoader.displayName = `WithDashboardLoader(${displayName})`;

  return ComponentWithDashboardLoader;
}
