import api from "@/utils/api";

export const apiRequest = async ({
  method = "GET",
  url,
  data = null,
  headers = {},
  params = {},
}) => {
  try {
    const response = await api.request({
      method,
      url,
      data,
      params,
      headers,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || error.message || "Request failed";
    throw new Error(message);
  }
};
