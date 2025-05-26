import React, { createContext, useEffect, useRef, useState } from "react";

import { auth, db, storage } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";


import { 
   onAuthStateChanged,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword,
   signOut,
   browserLocalPersistence,
   browserSessionPersistence,
   setPersistence
} from "firebase/auth";



export const AuthContext = createContext();



// Context Provider
export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
    
        return unsubscribe; // cleanup subscription on unmount
    }, []);


    const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logOut = () => signOut(auth);


    return (
        <AuthContext.Provider value={{ currentUser, loading, signUp, signIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}
