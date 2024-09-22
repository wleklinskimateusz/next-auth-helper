export abstract class CommonError extends Error {
  constructor(
    override message: string,
    public code: number
  ) {
    super();
  }
}
