export interface Folder {
    id: string;
    name: string;
    active: boolean;
    messagesTotal?: number;
    messagesUnread?: number;
    children?: Folder[];
    expand?: boolean;
}
