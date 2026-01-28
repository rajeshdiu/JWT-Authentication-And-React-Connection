import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

export const loginUser = async (username, password) => {
  const response = await axios.post(`${BASE_URL}token/`, {
    username,
    password,
  });

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");

  const response = await axios.post(`${BASE_URL}token/refresh/`, {
    refresh,
  });
  localStorage.setItem("access_token", response.data.access);
};
