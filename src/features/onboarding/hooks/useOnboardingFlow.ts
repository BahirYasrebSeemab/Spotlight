// import { useRouter } from 'expo-router';
// import { useCreateUser } from '@/src/features/user/hooks/useCreateUser';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/src/store';
// import { OnboardingData } from '@/src/shared/types/user.types';

// export function useOnboardingFlow() {
//   const router = useRouter();
//   const { submit } = useCreateUser();

//   const authUser = useSelector((state: RootState) => state.auth.user);

//   const complete = async (data: OnboardingData) => {
//     if (!authUser) throw new Error('Auth user missing');

//     await submit({
//       id: authUser.id,
//       email: authUser.email,
//       ...data,
//     });

//     router.replace('/(tabs)');
//   };

//   return { complete };
// }
