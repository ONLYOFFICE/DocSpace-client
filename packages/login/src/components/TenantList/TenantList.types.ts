type TPortal = { portalLink: string; portalName: string };

export type TenantListProps = {
  baseDomain: string;
  clientId: string;
  portals: TPortal[];
};

export type ItemProps = {
  portal: TPortal;
  baseDomain: string;
};
