export interface PublicRoomProps {
  roomData: {
    id: string;
    title: string;
    status: number;
    files?: any[];
    folders?: any[];
  } | null;
}
