import { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useLoadUser } from '../hooks/useLoadUser';
import IdentitySection from '../components/IdentitySection';

export default function ProfileScreen() {
  const { user, loading, load } = useLoadUser();

  useEffect(() => {
    const user = supabase.auth.getUser().then(res => {
      if (res.data.user) {
        load(res.data.user.id);
      }
    });
  }, []);

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted
        data={[]}
        renderItem={() => null}
        ListFooterComponent={<IdentitySection profile={user} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
