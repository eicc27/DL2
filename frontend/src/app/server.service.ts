import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  public static readonly LspServer = 'http://localhost:5000';

  constructor() { }
}
