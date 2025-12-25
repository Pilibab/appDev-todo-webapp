import { useContext, useState } from "react";
import "..//style/login.css";
import { useNavigate } from "react-router-dom";
import CredentialContext from "../context/CredentialContext";

const Login = () => {

    const {userName, setUserName, token, setToken, isAuth, setAuth} = useContext(CredentialContext);
    
    const navigate = useNavigate();
    
    // hold the input values
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    // Update state whenever the user types
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        console.log("Username:", username);
        console.log("Password:", password);

        const packageCredential = {
            username, password
        }

        try {
            const response = await fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(packageCredential)
            }) 

            const data = await response.json();

            if (response.ok) {
                console.log("Success:", data.message);
                alert("Account created! Now you can log in.");


            } else {
                console.log("error here ");
                console.error("Error:", data.error);
                alert(data.error);
            }

        } catch (err) {
            console.error("Network error:", err);
        }
    };

    const handleLogin = async () => {

        if (!formData.username || !formData.password) {
            alert("Please fill in both fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: formData.username, 
                    password: formData.password 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the JWT token
                localStorage.setItem("token", data.token);

                // Update Global Context
                // ~ although its useless since we are saving token in local storage
                setToken(data.token);
                setUserName(formData.username);
                setAuth(true);

                console.log("Login Success, token saved.");
                
                // Redirect to the todo page
                navigate("/to-do");

            } else {
                alert(data.error || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    };



return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleSubmit}>
                <h3>Login / Sign up</h3>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username} // Controlled input
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password} // Controlled input
                    onChange={handleChange}
                    required
                />

                <button type="submit">Sign Up</button>
                <button type="button" onClick={handleLogin}>Log in</button>
            </form>
        </div>
    );
};

export default Login;
