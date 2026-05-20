'use client';
import { useState, useEffect } from 'react';

export function useOwner() {
  const [isOwner, setIsOwner] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session-check')
      .then((r) => r.json())
      .then((data) => {
        setIsOwner(data.isOwner);
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { isOwner, user, loading };
}
