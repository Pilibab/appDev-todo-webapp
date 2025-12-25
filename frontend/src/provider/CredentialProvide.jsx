import { useState } from "react"
import CredentialContext from "../context/CredentialContext"

const CredentialProvider = ({children}) => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState("");
    
    const packageData = {userName, setUserName, password, setPassword, token, setToken}
    return (
        <CredentialContext.Provider value={packageData}>
            {children}
        </CredentialContext.Provider>
    )
}

export default CredentialProvider;