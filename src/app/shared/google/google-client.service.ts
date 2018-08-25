import { Injectable } from '@angular/core';

import { Folder, Message } from '../models';

@Injectable()
export class GoogleClientService {
  
  private folders: Array<Folder> = [];
  
  private messages: Array<Message> = [];
  
  private selectedMessage: Message;
  
  private gmailClient: any;
  private requestData = { userId: 'me' };
  private nextPageToken: string;
  private currentFolder: Folder;
  
  /**
   * Decode message's body from base64's to plain text, replacing few characters on the way.
   * @param resp
   * @returns {string}
   */
  static parsePlainHTML (resp: any): string {
    let text = '';
    
    text += atob(resp.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    
    return text;
  }
  
  /**
   * Parse message's body, split by parts. Iterate through each part and if it is simple, decode from base64 to text,
   * if complex, recursively call this function to parse it's subparts.
   * @param resp
   * @returns {string}
   */
  static parseAlternativeMultipart (resp: any): string {
    
    let msgText = '';
    
    resp.payload.parts.forEach((part: any) => {
      switch (part.mimeType) {
        case 'text/plain':
        case 'text/html':
          msgText += GoogleClientService.parsePlainHTML(part);
          break;
        
        case 'multipart/alternative':
        case 'multipart/mixed':
          msgText += GoogleClientService.parseAlternativeMultipart(part);
          break;
      }
    });
    
    return msgText;
    
  }
  
  constructor (
  ) {
  }
  
  public async loadGmailClient (): Promise<void> {
    
    await gapi.client.load('gmail', 'v1');
    
    this.gmailClient = gapi.client.gmail.users;
  }
  
  public getFolders(): Array<Folder> {
    return this.folders;
  }
  
  public async loadFolders (): Promise<void> {
    
    const resp = (await this.gmailClient.labels.list(this.requestData));
    
    const labels: any[] = resp.result.labels;
    const folders: Folder[] = [];
    
    const sortedLabels = labels.sort((l1: any, l2: any) => l1.name - l2.name);
    
    // each iteration returns Promise, and await Promise.all() waits for all of them to be finished
    await Promise.all(
      sortedLabels.map(async (label: any) => {
        if (label.type !== 'system' || label.labelListVisibility === 'labelShow') {
          await this.addFolder(label, folders);
        }
      })
    );
    
    this.folders = folders;
  }
  
  private async addFolder (data: {id: string, name: string}, folderList: Folder[]): Promise<void> {
    
    const subfolderSplitIndex = data.name.indexOf('/');
    
    const folderToAdd = <Folder>{
      id: data.id,
      active: false
    };
    
    if (subfolderSplitIndex > 0) {
      
      const foldersSplit = data.name.split('/');
      
      let parentFolder = folderList.find((f: Folder) => f.name === foldersSplit[ 0 ]);
      
      if (!parentFolder) {
        parentFolder = <Folder>{
          id: foldersSplit[ 0 ],
          name: foldersSplit[ 0 ],
          active: false,
          children: [],
          expand: false
        };
        
        folderList.push(parentFolder);
      }
      
      folderToAdd.name = foldersSplit[ 1 ];
      
      await this.getAdditionalFolderData(folderToAdd).then();
      
      parentFolder.children.push(folderToAdd);
      
    } else {
      
      const existing = folderList.find((f: Folder) => f.name === data.name);
      
      folderToAdd.name = data.name;
      
      await this.getAdditionalFolderData(folderToAdd).then();
      
      if (!existing) {
        folderList.push(folderToAdd);
      }
    }
  }
  
  /**
   * Getting folder data form the list doesn't return count of total and unread message.
   * These data will be added asynchronously after the folder instance is created.
   * @param {Folder} folder
   */
  private async getAdditionalFolderData (folder: Folder): Promise<void> {
    
    const requestData = Object.assign({
      id: folder.id
    }, this.requestData);
    
    const resp = (await this.gmailClient.labels.get(requestData)).result;
    
    folder.messagesTotal = resp.messagesTotal;
    folder.messagesUnread = resp.messagesUnread;
  }
  
  public getMessages(): Array<Message> {
    return this.messages;
  }
  
  public async loadMessages (folder: Folder, query: string = null): Promise<void> {
  
    const maxResults = 10;
  
    const requestData = Object.assign({
      q: query,
      labelIds: [ folder.id ],
      maxResults: maxResults,
      nextPageToken: null
    }, this.requestData);
  
    if (this.currentFolder) {
      if (this.currentFolder === folder) {
        if (this.nextPageToken) {
          requestData.nextPageToken = this.nextPageToken;
        }
      } else if (this.currentFolder !== folder) {
        this.currentFolder = folder;
      }
    }
  
    const resp = (await this.gmailClient.messages.list(requestData)).result;
  
    this.nextPageToken = resp.nextPageToken;
    const responseMessages: any[] = resp.messages;
  
    if (typeof responseMessages === 'undefined' || responseMessages.length === 0) {
      this.messages = [];
      return;
    }
  
    await this.parseMessages(responseMessages, folder).then();
  }
  
  private async parseMessages(responseMessages: Array<any>, folder: Folder): Promise<void> {
    
    const messages: Message[] = [];
    const messageCount = responseMessages.length;
    
    // console.log('message count', messageCount);
    
    await Promise.all(
      responseMessages.map(async (m: Message) => {
        
        const msg: Message = await this.getMessage(m.id, 'metadata');
  
        if (msg && typeof msg === 'object') {
          msg.folder = folder;
    
          messages.push(msg);
    
          if (messages.length === messageCount) {
            // console.log('messages length', messages.length);
      
            messages.sort((msg1: Message, msg2: Message) => msg2.internalDate - msg1.internalDate);
          }
        }
      })
    );
  
    this.messages = messages;
  }
  
  public async getMessage (msgId: string, format: string = 'full'): Promise<Message> {
    
    const requestData = Object.assign({
      id: msgId,
      format: format
    }, this.requestData);
    
    const resp = (await this.gmailClient.messages.get(requestData)).result;
    
    let msg: Message = null;
    const messages: Array<Message> = this.messages;
    
    if (format === 'raw') {
      msg = messages.find((m: Message) => m.id === msgId);
      msg.body = atob(resp.raw.replace(/-/g, '+').replace(/_/g, '/'));
    } else {
      
      const headers = {};
      
      resp.payload.headers.forEach((h: any) => {
        headers[ h.name ] = h.value;
      });
  
      let fromMatch = null;
      let toMatch = null;
      const nameEmailRegexp = /([\w\d\s\.\-\(\),]*)[<]*([\w\d\s\-\@\.]+)[>]*/gi;
      
      if ('From' in headers) {
        fromMatch = nameEmailRegexp.exec(headers[ 'From' ].replace(/"/g, ''));
      }
      
      if ('To' in headers) {
        toMatch = nameEmailRegexp.exec(headers[ 'To' ].replace(/"/g, ''));
      }
      
      if (fromMatch === null) {
        console.log(headers[ 'From' ]);
      }
      
      if (toMatch === null) {
        console.log(headers[ 'To' ]);
      }
      
      msg = <Message>{
        id: resp.id,
        subject: headers[ 'Subject' ],
        historyId: resp.historyId,
        threadId: resp.threadId,
        internalDate: resp.internalDate,
        from: fromMatch ? fromMatch[ 1 ] : '',
        fromEmail: fromMatch ? fromMatch[ 2 ] : '',
        to: toMatch ? toMatch[ 0 ] : '',
        toEmail: toMatch ? toMatch[ 1 ] : '',
        date: headers[ 'Date' ],
        mimeType: resp.payload.mimeType,
        read: resp.labelIds.indexOf('UNREAD') === -1
      };
      
      if (format === 'full') {
        
        console.log('mime', msg.mimeType);
        
        switch (msg.mimeType) {
          case 'text/plain':
          case 'text/html':
            msg.body = GoogleClientService.parsePlainHTML(resp.payload);
            break;
          
          case 'multipart/alternative':
            msg.body = GoogleClientService.parseAlternativeMultipart(resp);
            break;
        }
      }
      
    }
    
    return msg;
  }
  
  /**
   * In order to mark message as *unread*, it should be modified so that label "UNREAD" should be removed
   * from its list. After that is done, substract 1 from folder's unread count.
   * @param {Message} message
   */
  public markMessageRead (message: Message): void {
    
    const requestData = Object.assign({
      id: message.id,
      removeLabelIds: [ 'UNREAD' ]
    }, this.requestData);
    
    this.gmailClient.messages
      .modify(requestData)
      .execute(() => {
        message.read = true;
        message.folder.messagesUnread--;
      });
  }
  
  public sendMessage (msg: Message, callback: Function): void {
    
    let email = '';
    const headers = {
      'To': msg.toEmail,
      'Subject': msg.subject,
      'From': msg.fromEmail
    };
    
    Object.keys(headers).forEach((key: string) => {
      email += (key + ': ' + headers[ key ] + '\r\n');
    });
    
    email += '\r\n' + msg.body;
    
    const requestData = Object.assign({
      resource: {
        raw: window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
      }
    }, this.requestData);
    
    this.gmailClient.messages
      .send(requestData)
      .execute(() => callback());
  }
  
  /**
   * Delete given message.
   * After successful deletion, get new batch of the messages from the folder given message was in.
   * @param {Message} message
   */
  public deleteMessage (message: Message, callback: Function): void {
    
    const requestData = Object.assign({
      id: message.id
    }, this.requestData);
    
    this.gmailClient.messages
      .delete(requestData)
      .execute(() => {
        this.loadMessages(message.folder).then();
        callback();
      });
  }
}
