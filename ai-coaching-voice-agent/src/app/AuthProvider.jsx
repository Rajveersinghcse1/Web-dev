"use client";
import React, { useEffect, useState, createContext } from 'react';
import { useUser } from '@stackframe/stack';
import { api } from '../../convex/_generated/api';
import { useMutation } from 'convex/react';

export const UserContext = createContext(null);

function AuthProvider({ children }){
    const user = useUser();
    const CreateUser = useMutation(api.users.CreateUser);
    const [userData , setUserData] = useState(null);

    useEffect(() =>{
        console.log('AuthProvider user:', user);
        if (user && user.primaryEmail) {
            CreateNewUser();
        }
    },[user])

    const CreateNewUser = async () =>{
        try {
            const result = await CreateUser({
                name: user?.displayName || 'Unknown',
                email: user?.primaryEmail || ''
            });
            console.log('CreateNewUser result:', result);
            setUserData(result);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    }


    return (
        <UserContext.Provider value={{userData , setUserData}}>
            {children}
        </UserContext.Provider>
    )
}

export default AuthProvider;