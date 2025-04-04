export interface ISgTransportOptions {
    auth: {
        apiKey: string
    }
}

export interface ISgMessageOptions {
    to: string | Array<string>;
    from: string;
    subject: string;
    text: any;
    html: any;
}

export interface INodemailerTransport {
    send(options: ISgTransportOptions, data: ISgMessageOptions): Promise<void>;
    sendBulk(options: ISgTransportOptions, messages: ISgMessageOptions[]): Promise<void>;
  }
  