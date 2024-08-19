import { ImagePickerAsset } from "expo-image-picker";
import { Models } from "react-native-appwrite";

export type User = {
  username: string;
  email: string;
  avatar: string;
  accountId: string;
  liked_videos: Video[];
};

export type AppwriteUser = Models.Document & User;

export type Video = {
  title: string;
  thumbnail: string;
  prompt: string;
  video: string;
  creator: User;
  likes: AppwriteUser[];
};

export type AppwriteVideo = Models.Document & Video;

export type TForm = {
  title: string;
  video: ImagePickerAsset | null;
  thumbnail: ImagePickerAsset | null;
  prompt: string;
};
