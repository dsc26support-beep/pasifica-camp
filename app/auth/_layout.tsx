import { Stack } from 'expo-router';
import { Theme } from '../../constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.background },
      }}
    />
  );
}
