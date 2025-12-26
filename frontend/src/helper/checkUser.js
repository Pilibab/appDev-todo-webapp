// helper function 

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASEURL;


const checkIfUserExist = async (username) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/check-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username }) // Use the dynamic parameter
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        
        // Either True or false 
        return data.exists; 
    } catch (err) {
        console.error("Fetch error:", err);
        return false; // Assume user doesn't exist if the server is down
    }
}

export default checkIfUserExist;