import { Models } from "react-native-appwrite";

export type User = {
  username: string;
  email: string;
  avatar: string;
  accountId: string;
};

export type AppwriteUser = Models.Document & User;

export type Video = {
  title: string;
  thumbnail: string;
  prompt: string;
  video: string;
  creator: User;
};

export type AppwriteVideo = Models.Document & Video;

export type TForm = {
  title: string;
  video: DocumentPicker.DocumentPickerAsset | null;
  thumbnail: DocumentPicker.DocumentPickerAsset | null;
  prompt: string;
};
