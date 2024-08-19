import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { memo, useState } from "react";
import { AppwriteVideo } from "@/types";
import icons from "@/constants/icons";
import { ResizeMode, Video } from "expo-av";
import { useGlobalContext } from "@/context/GlobalProvider";
import { likeVideo, unlikeVideo } from "@/lib/appwrite";

interface VideoCardProps {
  video: AppwriteVideo;
  hideBookmark?: boolean;
}

const VideoCard = ({
  video: {
    title,
    thumbnail,
    video,
    creator: { username, avatar },
    likes,
    $id: videoId,
  },
  hideBookmark,
}: VideoCardProps) => {
  const { user } = useGlobalContext();
  const [play, setPlay] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  const isLiked = localLikes.some((likedUser) => likedUser.$id === user?.$id);

  const handleLike = async () => {
    if (!user) return;

    setIsLiking(true);
    const newLikes = isLiked
      ? localLikes.filter((like) => like.$id !== user.$id)
      : [...localLikes, user];

    setLocalLikes(newLikes);

    try {
      await (isLiked ? unlikeVideo : likeVideo)(videoId, user.$id);
    } catch (error) {
      console.error("Error toggling like:", error);
      setLocalLikes(localLikes); // Revert on error
      Alert.alert("Error", "Failed to update like status. Please try again.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-md"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        {!hideBookmark && (
          <TouchableOpacity
            className="pt-2"
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.7}
          >
            <Image
              source={icons.bookmark}
              className="w-5 h-5"
              resizeMode="contain"
              tintColor={isLiked ? "#FFA001" : "#CDCDE0"}
            />
          </TouchableOpacity>
        )}
      </View>

      {play ? (
        <Video
          source={{
            // note: avoid vimeo or yt links
            uri: video,
          }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3 "
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(VideoCard);
