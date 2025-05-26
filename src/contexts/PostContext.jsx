import React, { useState } from 'react'
import { createContext } from 'react';

export const PostContext = createContext();


export const PostContextProvider = ({ children })=> {
    const [postDetails, setPostDetails] = useState()

    return (
        <PostContext.Provider value={{postDetails, setPostDetails}}>
            { children }
        </PostContext.Provider>
    )
}