export const parseChildren = (
  children: any,
  headerDisplayName: any,
  bodyDisplayName: any,
  footerDisplayName: any,
  containerDisplayName: any
) => {
  let header = null,
    body = null,
    footer = null,
    container = null;

  children.forEach((child: any) => {
    const childType =
      child && child.type && (child.type.displayName || child.type.name);

    switch (childType) {
      case headerDisplayName:
        header = child;
        break;
      case bodyDisplayName:
        body = child;
        break;
      case footerDisplayName:
        footer = child;
        break;
      case containerDisplayName:
        container = child;
        break;
      default:
        break;
    }
  });
  return [header, body, footer, container];
};
