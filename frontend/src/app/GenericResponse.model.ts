export default class GenericResponse<T> {
  public constructor(
    public code: number,
    public message: string,
    public data: T
  ) {}
}
