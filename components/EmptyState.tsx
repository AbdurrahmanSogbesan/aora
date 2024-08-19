import { View, Text, Image } from "react-native";
import React from "react";
import images from "@/constants/images";
import CustomButton from "./CustomButton";
import { router } from "expo-router";

interface EmptyStateProps {
  title: string;
  subTitle: string;
  hideCreateButton?: boolean;
}

const EmptyState = ({ title, subTitle, hideCreateButton }: EmptyStateProps) => {
  return (
    <View className="justify-center items-center px-4">
      <Image
        source={images.empty}
        resizeMode="contain"
        className="w-[270px] h-[215px]"
      />
      <Text className="text-xl font-psemibold text-white text-center mt-2">
        {title}
      </Text>
      <Text className="font-pmedium text-sm text-gray-100">{subTitle}</Text>
      {!hideCreateButton && (
        <CustomButton
          title="Create Video"
          handlePress={() => router.push("/create")}
          containerStyles="w-full my-5"
        />
      )}
    </View>
  );
};

export default EmptyState;
