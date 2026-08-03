import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, LoadingState } from '@/components/feedback';
import { Screen, ScreenHeader } from '@/components/layout';
import { Button } from '@/components/ui';
import { APP_MESSAGES } from '@/constants/messages';
import { HistoryListItem } from '@/features/epi-detection/components';
import { useDetectionHistory } from '@/features/epi-detection/hooks/useDetectionHistory';
import type { EpiDetectionResult } from '@/features/epi-detection/types';
import { spacing } from '@/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const { items, loading, error, reload, remove, clear } = useDetectionHistory();

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }, [router]);

  const confirmClear = useCallback(() => {
    Alert.alert(
      APP_MESSAGES.history.clearConfirmTitle,
      APP_MESSAGES.history.clearConfirmDescription,
      [
        { text: APP_MESSAGES.common.cancel, style: 'cancel' },
        { text: APP_MESSAGES.common.delete, style: 'destructive', onPress: () => void clear() },
      ],
    );
  }, [clear]);

  const confirmRemove = useCallback(
    (result: EpiDetectionResult) => {
      Alert.alert(
        APP_MESSAGES.history.removeConfirmTitle,
        APP_MESSAGES.history.removeConfirmDescription,
        [
          { text: APP_MESSAGES.common.cancel, style: 'cancel' },
          {
            text: APP_MESSAGES.common.remove,
            style: 'destructive',
            onPress: () => void remove(result.id),
          },
        ],
      );
    },
    [remove],
  );

  const openDetails = useCallback(
    (result: EpiDetectionResult) => {
      router.push({ pathname: '/result', params: { id: result.id } });
    },
    [router],
  );

  const renderBody = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <ErrorState error={error} onRetry={() => void reload()} />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.centered}>
          <EmptyState
            icon="history"
            title={APP_MESSAGES.history.emptyTitle}
            description={APP_MESSAGES.history.emptyDescription}
            action={{
              label: APP_MESSAGES.home.startButton,
              onPress: () => router.replace('/camera'),
              icon: 'camera',
            }}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <HistoryListItem result={item} onPress={openDetails} onRemove={confirmRemove} />
        )}
        ListFooterComponent={
          <Button
            label={APP_MESSAGES.history.clearButton}
            icon="trash-can-outline"
            variant="ghost"
            onPress={confirmClear}
            style={styles.clearButton}
          />
        }
      />
    );
  };

  return (
    <Screen>
      <ScreenHeader
        title={APP_MESSAGES.history.title}
        subtitle={APP_MESSAGES.history.subtitle}
        onBack={goBack}
      />
      {renderBody()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  clearButton: {
    marginTop: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
});
