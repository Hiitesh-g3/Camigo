import { axiosInstance } from "../lib/axios";

export const signUp = async(signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
      return response.data;
}

export const login = async(loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
}

export const logout = async() => {
  const response = await axiosInstance.post("/auth/logout");
    return response.data;
}

export const getAuthUser = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      return res.data ;
    } catch (error) {
      return null ;
    }
}

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
}

export const getFriends = async () => {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export const getRecommendedUsers = async () => {
  const response = await axiosInstance.get("/users") ;
  return response.data;
}

export const getOutgoingRequests = async () => {
  const response = await axiosInstance.get("/users/outgoing-requests") ;
  return response.data;
}

export const sendFriendRequest = async (userId) => {
  console.log(userId);
  const response = await axiosInstance.post(`/users/friend-request/:${userId}`);
  return response.data;
}

export const getFriendRequests = async () => {
  const response = await axiosInstance.get("/users/friend-requests") ;
  return response.data;
}

export const acceptFriendRequests = async (requestId) => {
  const response = await axiosInstance.put(`/users/friend-request/:${requestId}`);
  return response.data;
}

export const getStreamToken = async () => {
  const response = await axiosInstance.get("/chats/token") ;
  return response.data;
}