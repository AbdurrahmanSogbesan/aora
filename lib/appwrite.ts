import { AppwriteUser, AppwriteVideo } from "@/types";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
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
        accountId: newAcc.$id,
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
      await account.deleteSession("current");
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
      [Query.equal("accountId", currentAccount.$id)]
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
    const posts = await databases.listDocuments(databaseId, videoCollectionId);

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
