import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public static readonly LspServer = 'http://54.86.213.128:8080';

  public static readonly LoginServer = 'http://localhost:8080';

  public static readonly N4JServer = 'http://34.203.200.221:7474';

  constructor() { }
}
