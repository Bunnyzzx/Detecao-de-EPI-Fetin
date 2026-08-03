import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.slate[50] },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="panel" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
