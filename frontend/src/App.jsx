import { Routes, Route, Navigate } from 'react-router-dom'
import '../src/style/App.css'
import Login from './pages/Login'
import ToDo from './pages/ToDo'
import { useContext } from 'react'
import CredentialContext from './context/CredentialContext'

function App() {

  const {userName, setUserName, token, setToken, isAuth, setAuth} = useContext(CredentialContext);

  return (
    <Routes>


      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* remove this path  */}
      {/* <Route path="/" element={<Navigate to="/to-do" replace />} /> */}


      
      <Route path="/login" element={<Login/>} />
      <Route path="/to-do" element={<ToDo />} />
    </Routes>



  )
}

export default App
