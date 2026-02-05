import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLogout } from '../../auth/hooks';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserBrandStatus } from '@/src/features/brands/hooks/useUserBrandStatus';
import BlurConfirmModal from '@/src/shared/components/Modal';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { ChevronRight } from 'lucide-react-native';

function Row({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 bg-white/5 rounded-xl mb-2"
      activeOpacity={0.7}
    >
      <Text className={`text-base ${danger ? 'text-red-500' : 'text-white'}`}>{label}</Text>
      <ChevronRight size={20} color={danger ? '#EF4444' : '#ffffff'} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { handleLogout } = useLogout();
  const router = useRouter();
  const currentUser = useAppSelector(state => state.auth.user);
  const { data: brandStatus, isLoading: brandLoading } = useUserBrandStatus(currentUser?.id);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = () => {
    console.log('💀 User confirmed account deletion');
    setDeleteModalVisible(false);
    // call your hook / service to delete the account here
  };

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black p-6">
        {/* Brand Management Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-white mb-4">Brand Management</Text>

          {brandLoading ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : brandStatus?.hasBrand ? (
            <View>
              {/* Pending Application */}
              {brandStatus.brand?.applicationStatus === 'pending' && (
                <View className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-3">
                  <Text className="text-yellow-400 font-semibold mb-1">Application Under Review</Text>
                  <Text className="text-gray-300 text-sm">
                    Submitted on {new Date(brandStatus.brand.appliedAt!).toLocaleDateString()}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-2">
                    We'll notify you once your application has been reviewed.
                  </Text>
                </View>
              )}

              {/* Approved - Show Manage Brand Button */}
              {brandStatus.brand?.applicationStatus === 'approved' && (
                <TouchableOpacity
                  onPress={() => router.push(`/brand/${brandStatus.brand?.id}/dashboard` as any)}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 flex-row items-center justify-between mb-3"
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="text-white font-semibold text-base">{brandStatus.brand.name}</Text>
                    <Text className="text-gray-400 text-sm">Manage your brand dashboard</Text>
                  </View>
                  <ChevronRight size={20} color="#ffffff" />
                </TouchableOpacity>
              )}

              {/* Rejected - Show Reason + Reapply */}
              {brandStatus.brand?.applicationStatus === 'rejected' && (
                <View>
                  <View className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-3">
                    <Text className="text-red-400 font-semibold mb-1">Application Rejected</Text>
                    {brandStatus.brand.rejectionReason && (
                      <Text className="text-gray-300 text-sm mt-1">{brandStatus.brand.rejectionReason}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/settings/brand-application')}
                    className="bg-white rounded-xl p-4"
                    activeOpacity={0.7}
                  >
                    <Text className="text-black text-center font-semibold">Apply Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            // No Brand - Show Apply Button
            <TouchableOpacity
              onPress={() => router.push('/settings/brand-application')}
              className="bg-white rounded-xl p-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View>
                <Text className="text-black font-semibold text-base">Apply for Brand Status</Text>
                <Text className="text-gray-600 text-sm">Verify your brand and unlock features</Text>
              </View>
              <ChevronRight size={20} color="#000000" />
            </TouchableOpacity>
          )}
        </View>

        {/* Account Section */}
        <Text className="text-xl font-bold text-white mb-4">Account</Text>
        <Row label="Account Privacy" onPress={() => router.navigate('(tabs)/profile/account-privacy')} />
        <Row label="Edit Profile" onPress={() => router.navigate('(tabs)/profile/edit-profile')} />
        <Row label="Change Password" onPress={() => router.navigate('(tabs)/profile/change-password')} />

        {/* Danger Zone */}
        <View className="mt-6">
          <Text className="text-xl font-bold text-white mb-4">Danger Zone</Text>
          <Row label="Delete Account" danger onPress={() => setDeleteModalVisible(true)} />
          <Row label="Logout" danger onPress={handleLogout} />
        </View>

        {/* Delete Confirmation Modal */}
        <BlurConfirmModal
          visible={deleteModalVisible}
          title="Are you sure?"
          message="This action is irreversible. Type your username to confirm deletion."
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={handleDeleteConfirm}
        />
      </View>
    </Spotlight>
  );
}
