import { Injectable } from '@angular/core';

import { Label, Message } from '../models';

function compareLabels(l1: any, l2: any): number {
  return (l1.name < l2.name ? -1 : (l1.name > l2.name ? 1 : 0));
}

@Injectable()
export class GoogleClientService {
  
  private labels: Array<Label> = [];
  
  private messages: Array<Message> = [];
  
  private gmailClient: any;
  private requestData = { userId: 'me' };
  private nextPageToken: string;
  
  private currentLabel: Label;
  private currentQuery: string;
  private currentPageToken: string;
  private pageTokens: Array<string> = [];
  
  public hasPreviousPage: boolean;
  public hasNextPage: boolean;
  
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
  
  constructor () {
  }
  
  public async loadGmailClient (): Promise<void> {
    
    await gapi.client.load('gmail', 'v1');
    
    this.gmailClient = gapi.client.gmail.users;
  }
  
  public getLabels (): Array<Label> {
    return this.labels;
  }
  
  public async loadLabels (): Promise<void> {
    
    const resp = (await this.gmailClient.labels.list(this.requestData));
    
    const labelsResult: any[] = resp.result.labels;
    const labels: Label[] = [];
    
    const sortedLabels = labelsResult.sort(compareLabels);
    
    // each iteration returns Promise, and await Promise.all() waits for all of them to be finished
    await Promise.all(
      sortedLabels.map(async (label: any) => {
        if (label.type !== 'system' || label.labelListVisibility === 'labelShow') {
          await this.addLabel(label, labels);
        }
      })
    );
    
    this.labels = labels.sort(compareLabels);
  }
  
  private async addLabel (data: Label, labelList: Label[]): Promise<void> {
    
    const sublabelSplitIndex = data.name.indexOf('/');
    
    const labelToAdd = <Label>{
      id: data.id,
      active: false
    };
    
    if (sublabelSplitIndex > 0) {
      
      const labelsSplit = data.name.split('/');
      
      let parentLabel = labelList.find((f: Label) => f.name === labelsSplit[ 0 ]);
      
      if (!parentLabel) {
        parentLabel = <Label>{
          id: labelsSplit[ 0 ],
          name: labelsSplit[ 0 ],
          active: false,
          children: [],
          expand: false
        };
        
        labelList.push(parentLabel);
      }
      
      labelToAdd.name = labelsSplit[ 1 ];
      
      await this.getAdditionalLabelData(labelToAdd);
      
      parentLabel.children.push(labelToAdd);
      
    } else {
      
      const existing = labelList.find((f: Label) => f.name === data.name);
      
      if (!existing) {
  
        labelToAdd.name = data.name;
  
        await this.getAdditionalLabelData(labelToAdd);
        
        labelList.push(labelToAdd);
      }
    }
  }
  
  /**
   * Getting label data form the list doesn't return count of total and unread message.
   * These data will be added asynchronously after the label instance is created.
   * @param {Label} label
   */
  private async getAdditionalLabelData (label: Label): Promise<void> {
    
    const requestData = Object.assign({
      id: label.id
    }, this.requestData);
    
    const resp = (await this.gmailClient.labels.get(requestData)).result;
    
    label.messagesTotal = resp.messagesTotal;
    label.messagesUnread = resp.messagesUnread;
  }
  
  public getMessages (): Array<Message> {
    return this.messages;
  }
  
  public async getNextMessagePage (): Promise<void> {
    await this.loadMessages(this.currentLabel, this.currentQuery, this.nextPageToken);
  }
  
  public async getPreviousMessagePage (): Promise<void> {
    const previousToken = this.pageTokens.pop();
    this.nextPageToken = null;
    
    if (this.pageTokens.length === 0) {
      this.hasPreviousPage = false;
    }
    
    await this.loadMessages(this.currentLabel, this.currentQuery, previousToken, true);
  }
  
  public async loadMessages (label: Label, query: string = null, pageToken: string = null, goingBackwards: boolean = false): Promise<void> {
    
    const maxResults = 10;
    
    this.currentQuery = query;
    
    const requestData = Object.assign({
      q: query,
      labelIds: [ label.id ],
      maxResults: maxResults,
      pageToken: pageToken
    }, this.requestData);
    
    let resp = null;
    
    try {
      resp = (await this.gmailClient.messages.list(requestData)).result;
    } catch (ex) {
      console.log('exception', ex);
    }
    
    // add current token to list of previous tokens if not going backwards
    if (this.currentPageToken !== undefined && !goingBackwards) {
      this.pageTokens.push(this.currentPageToken);
      this.hasPreviousPage = true;
    }
    
    // if label has changed or current label does not exist, reset previous tokens list
    if (!this.currentLabel || this.currentLabel.id !== label.id) {
      this.pageTokens = [];
      this.hasPreviousPage = false;
      this.currentPageToken = null;
    }
    
    // set current page token to provided token
    this.currentPageToken = pageToken;
    
    this.currentLabel = label;
    this.nextPageToken = resp.nextPageToken;
    this.hasNextPage = !!this.nextPageToken;
    
    const responseMessages: any[] = resp.messages;
    
    if (typeof responseMessages === 'undefined' || responseMessages.length === 0) {
      this.messages = [];
      return;
    }
    
    await this.getMessagesData(responseMessages, label).then();
  }
  
  private async getMessagesData (responseMessages: Array<any>, label: Label): Promise<void> {
    
    const messages: Message[] = [];
    
    await Promise.all(
      responseMessages.map(async (m: Message) => {
        
        const msg: Message = await this.getMessage(m.id, 'metadata');
        
        if (msg && typeof msg === 'object') {
          msg.label = label;
          
          messages.push(msg);
        }
      })
    );
    
    messages.sort((msg1: Message, msg2: Message) => msg2.internalDate - msg1.internalDate);
    
    this.messages = messages;
  }
  
  public async getMessage (msgId: string, format: string = 'full'): Promise<Message> {
    
    const requestData = Object.assign({
      id: msgId,
      format: format
    }, this.requestData);
    
    const resp = (await this.gmailClient.messages.get(requestData)).result;
    
    let msg: Message = null;
    
    if (format === 'raw') {
      const messages: Array<Message> = this.messages;
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
   * from its list. After that is done, substract 1 from labels's unread count.
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
        message.label.messagesUnread--;
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
   * After successful deletion, get new batch of the messages from the label given message was in.
   * @param {Message} message
   * @param {Function} callback
   */
  public deleteMessage (message: Message, callback: Function): void {
    
    const requestData = Object.assign({
      id: message.id
    }, this.requestData);
    
    this.gmailClient.messages
      .delete(requestData)
      .execute(() => callback());
  }
}
