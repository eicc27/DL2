import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  public static readonly LspServer = 'http://dl2-fileservice.us-east-1.elasticbeanstalk.com';

  public static readonly LoginServer = 'http://localhost:8080';

  public static readonly N4JServer =
    'https://7ob7z53ir6.execute-api.us-east-1.amazonaws.com/default/N4JService';

  public static readonly SearchServer =
    'https://8dajt5pqyd.execute-api.us-east-1.amazonaws.com/default/SearchService';
  constructor() {}
}
