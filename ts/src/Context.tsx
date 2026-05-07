import React, { createContext, useState, useContext, type ReactNode } from 'react';


const LuminaContext = createContext<any>(null);


export const LuminaProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  return (
    <LuminaContext.Provider value={{ user, setUser,email,setEmail,userName,setUserName }}>
      {children}
    </LuminaContext.Provider>
  );
};


export const useLumina = () => useContext(LuminaContext);