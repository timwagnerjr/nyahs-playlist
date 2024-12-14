'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Get user from session/local storage/context
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
            setUser(JSON.parse(currentUser));
        }
    }, []);

    return user;
} 