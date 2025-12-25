import { useState } from "react"
import CredentialContext from "../context/CredentialContext"

const CredentialProvider = ({children}) => {
    const [userName, setUserName] = useState("");
    // const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    const [isAuth, setAuth] = useState(false);
    
    // const packageData = {userName, setUserName, password, setPassword, token, setToken}
    const packageData = {userName, setUserName, token, setToken, isAuth, setAuth}
    return (
        <CredentialContext.Provider value={packageData}>
            {children}
        </CredentialContext.Provider>
    )
}

export default CredentialProvider;