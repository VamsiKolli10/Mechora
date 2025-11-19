export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) {
    return fallback;
  }

  const apiError = error.response?.data?.error ?? error.error;

  if (typeof apiError === "string") {
    return apiError;
  }

  if (apiError?.message) {
    return apiError.message;
  }

  if (error.message) {
    return error.message;
  }

  if (apiError && typeof apiError === "object") {
    try {
      return JSON.stringify(apiError);
    } catch {
      return fallback;
    }
  }

  return fallback;
};
