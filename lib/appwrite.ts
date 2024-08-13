import { AppwriteUser } from "@/types";
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

// Init your React Native SDK
const client = new Client();
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

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
      config.databaseId,
      config.userCollectionId,
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
      config.databaseId,
      config.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;

    return currentUser.documents[0] as AppwriteUser;
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
}
