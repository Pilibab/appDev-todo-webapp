/**
 * Global API wrapper to handle authentication and auto-logout
 * @param {string} endpoint - The API path (e.g., "/api/tasks")
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const authorizedFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    // 1. Prepare headers
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // 2. Attach token if it existsac
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        // 3. THE LISTENER: Catch Invalid Token or Expired Token (401)
        if (response.status === 401 || data.error === "Invalid token") {
            console.warn("Auth token invalid. Redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            
            // Redirect to login
            window.location.href = "/login";
            return null;
        }

        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};