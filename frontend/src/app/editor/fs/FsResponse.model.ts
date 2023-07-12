export class Dirs {
  public constructor(public name: string, public type: string) {}
}

export default class FsResponse {
  public constructor(
    public isNew: boolean,
    public userId: string,
    public parent: string,
    public dirs: Dirs[]
  ) {}
}
