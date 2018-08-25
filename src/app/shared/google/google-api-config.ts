import ClientConfig = gapi.auth2.ClientConfig;

export interface GoogleApiConfig extends ClientConfig {
  discoveryDocs: string[];
  immediate?: boolean;
}
