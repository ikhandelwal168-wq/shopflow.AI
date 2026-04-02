import React, { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = storage.getUser();
    if (currentUser) {
      setUser({ id: currentUser.id, email: currentUser.email });
      setProfile(currentUser);
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    storage.clearUser();
    setUser(null);
    setProfile(null);
  };

  const signIn = (email: string) => {
    const mockUser = { ...storage.getUser()!, email };
    storage.saveUser(mockUser);
    setUser({ id: mockUser.id, email: mockUser.email });
    setProfile(mockUser);
  };

  return { user, profile, loading, signOut, signIn };
}
