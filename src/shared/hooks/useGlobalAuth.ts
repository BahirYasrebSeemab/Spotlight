// import { useEffect } from 'react';
// import { supabase } from '@/src/lib/supabase';
// import { useRouter } from 'expo-router';
// import { store } from '@/src/store';
// import { setUser } from '@/src/features/auth/slices/authSlice';
// import { getUser, createUser } from '@/src/features/user/services/userServices';
// import { CreateUserPayload, SupabaseAuthUser } from '@/src/shared/types/user.types';
// import { generateUniqueUsername } from '@/src/shared/helpers/generateUniqueUsername';

// export function useGlobalAuth() {
//   const router = useRouter();

//   useEffect(() => {
//     const run = async () => {
//       // --- GET SESSION ---
//       const { data: sessionData } = await supabase.auth.getSession();
//       const session = sessionData.session;

//       // === 1. NOT LOGGED IN ===
//       if (!session?.user) {
//         store.dispatch(setUser(null));
//         router.replace('/(auth)');
//         return;
//       }

//       const authUser = session.user as unknown as SupabaseAuthUser;
//       const verified = !!authUser.email_confirmed_at;

//       store.dispatch(setUser(authUser));

//       // === 2. CHECK DB USER ===
//       let { data: dbUser } = await getUser(authUser.id);

//       // === 3. LOGGED IN BUT NO DB ROW ===
//       if (!dbUser) {
//         if (!verified) {
//           // Logged in but NOT verified → LIMITED ACCESS
//           router.replace('/(tabs)');
//           return;
//         }

//         // VERIFIED → create DB user
//         const username = await generateUniqueUsername(authUser.email);

//         const payload: CreateUserPayload = {
//           id: authUser.id,
//           email: authUser.email,
//           username,
//           name: authUser.user_metadata?.full_name || null,
//           avatarUrl: authUser.user_metadata?.avatar_url || null,
//           dob: null,
//           bio: null,
//         };

//         const { data: createdUser } = await createUser(payload);

//         // if user failed to create → throw
//         if (!createdUser) {
//           console.error('Failed to create user row');
//           return;
//         }

//         router.replace('/onboarding');
//         return;
//       }

//       // === 4. DB EXISTS BUT NOT VERIFIED ===
//       if (!verified) {
//         // limited access
//         router.replace('/(tabs)');
//         return;
//       }

//       // === 5. VERIFIED BUT ONBOARDING NOT COMPLETE ===
//       if (!dbUser.onboardingComplete) {
//         router.replace('/onboarding');
//         return;
//       }

//       // === 6. ALL GOOD ===
//       router.replace('/(tabs)');
//     };

//     run();

//     // === LISTEN FOR LOGOUT ===
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (!session) {
//         store.dispatch(setUser(null));
//         router.replace('/(auth)');
//       }
//     });

//     return () => listener.subscription.unsubscribe();
//   }, []);
// }
