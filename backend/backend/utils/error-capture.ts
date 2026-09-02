let lastCapturedError:
  unknown | undefined;


export function captureError(
  error: unknown
): void {

  lastCapturedError =
    error;

}


export function consumeLastCapturedError()
  : Error | undefined {

  const error =
    lastCapturedError;

  lastCapturedError =
    undefined;


  if (
    error instanceof Error
  ) {

    return error;

  }


  if (
    error !== undefined
  ) {

    return new Error(
      String(error)
    );

  }


  return undefined;

}


export function getLastCapturedError():
  unknown | undefined {

  return lastCapturedError;

}
