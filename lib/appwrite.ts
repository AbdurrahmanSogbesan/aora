import { AppwriteUser, AppwriteVideo, TForm } from "@/types";
import { ImagePickerAsset } from "expo-image-picker";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  ImageGravity,
  Query,
  Storage,
} from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM_ID || "",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "",
  userCollectionId: "users",
  videoCollectionId: "videos",
  storageId: "files",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

// Functions to interact with Appwrite
export async function createUser(
  email: string,
  password: string,
  username: string
) {
  try {
    const newAcc = await account.create(ID.unique(), email, password, username);

    if (!newAcc) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAcc?.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser as AppwriteUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    // workaround for appwrite not allowing multiple active sessions
    try {
      await account.get();
      // logout
      await signOut();
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      return await account.createEmailPasswordSession(email, password);
    }
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount?.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0] as AppwriteUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function getPosts() {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents as AppwriteVideo[];
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(7),
    ]);

    return posts.documents as AppwriteVideo[];
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function searchPosts(query: string) {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.search("title", query),
    ]);

    return posts.documents as AppwriteVideo[];
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [
      Query.equal("creator", userId),
      Query.orderDesc("$createdAt"),
    ]);

    return posts.documents as AppwriteVideo[];
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function signOut() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function getFilePreview(fileId: string, type: "image" | "video") {
  let fileUrl;
  try {
    if (type === "video") {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        ImageGravity.Top,
        100
      );
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function uploadFile(
  file: ImagePickerAsset,
  type: "image" | "video"
) {
  if (!file) return;
  const { fileName, mimeType, fileSize, uri } = file;

  try {
    const uploadedFile = await storage.createFile(storageId, ID.unique(), {
      name: fileName as string,
      uri,
      type: mimeType as string,
      size: fileSize as number,
    });

    console.log("uploadedFile", uploadedFile);

    const fileUrl = await getFilePreview(uploadedFile?.$id, type);
    return fileUrl;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}

export async function createVideo(form: TForm & { userId: string }) {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail!, "image"),
      uploadFile(form.video!, "video"),
    ]);

    const { title, prompt, userId } = form;

    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title,
        video: videoUrl,
        thumbnail: thumbnailUrl,
        prompt,
        creator: userId,
      }
    );

    return newPost as AppwriteVideo;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}
