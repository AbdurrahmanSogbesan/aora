import { Models } from "react-native-appwrite";

export type User = {
  username: string;
  email: string;
  avatar: string;
  accountId: string;
};

export type AppwriteUser = AppwriteUser;

export type Video = {
  title: string;
  thumbnail: string;
  prompt: string;
  video: string;
  creator: User;
};

export type AppwriteVideo = Models.Document & Video;
