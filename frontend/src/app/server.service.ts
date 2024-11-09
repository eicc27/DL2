import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  public static readonly LspServer = 'http://localhost:5000';

  public static readonly UserServer = 'http://localhost:8080';

  public static readonly N4JServer =
    'http://localhost:8081';

  public static readonly SearchServer =
    'http://localhost:8091';

  public static readonly RAGServer =
    'http://localhost:8092';
  constructor() {}
}
