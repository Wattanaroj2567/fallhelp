import React from 'react';
import { Text, View } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View className="gap-4">
      <View className="items-center gap-3 px-10">
        <Text className="text-lg text-gray-900 text-center">
          Open up the code for this screen:
        </Text>

        <View className="rounded-md bg-gray-100 px-2 py-1">
          <MonoText className="text-sm text-gray-800">{path}</MonoText>
        </View>

        <Text className="text-lg text-gray-900 text-center">
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>

      <View className="items-center px-6">
        <ExternalLink
          className="py-3"
          href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
          <Text className="text-center text-base text-sky-600 font-semibold">
            Tap here if your app doesn't automatically update after making changes
          </Text>
        </ExternalLink>
      </View>
    </View>
  );
}
