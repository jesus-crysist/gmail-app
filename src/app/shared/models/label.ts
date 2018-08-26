export interface Label {
    id: string;
    name: string;
    active: boolean;
    messagesTotal?: number;
    messagesUnread?: number;
    children?: Label[];
    expand?: boolean;
}
