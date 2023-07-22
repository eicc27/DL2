import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public static readonly LspServer = 'http://54.86.213.128:8080';

  public static readonly LoginServer = 'http://localhost:8080';

  public static readonly N4JServer = 'https://7ob7z53ir6.execute-api.us-east-1.amazonaws.com/default/N4JService';

  constructor() { }
}
