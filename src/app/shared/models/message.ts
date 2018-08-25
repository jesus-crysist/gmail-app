import { Folder } from './folder';

export interface Message {
    id?: string;
    subject?: string;
    historyId?: string;
    threadId?: string;
    internalDate?: number;
    from: string;
    fromEmail: string;
    to: string;
    toEmail: string;
    date: string;
    mimeType: string;
    body?: string;
    read?: boolean;
    open?: boolean;
    folder?: Folder;
}
