import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnalysisProvider } from '@/features/epi-detection/hooks/AnalysisContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AnalysisProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.slate[50] },
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="camera" options={{ animation: 'fade' }} />
          <Stack.Screen name="result" />
        </Stack>
      </AnalysisProvider>
    </SafeAreaProvider>
  );
}
