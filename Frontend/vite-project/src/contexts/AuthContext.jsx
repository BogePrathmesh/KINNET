import axios from "axios";
import { createContext, useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
});

export const AuthProvider = ({ children }) => {
    const authcontext = useContext(AuthContext);

    const [userdata, setuserdata] = useState(authcontext);



    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })

            return request.data.message;
        } catch (err) {
            if (err.response?.status === 409) {
                throw new Error("Username already exists");
            }
            throw new Error("Registration failed");
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post('/login', {
                username: username,
                password: password,
            })

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
            }
        } catch (err) {
            throw err;
        }
    }

    const router = useNavigate();

    const data = {
        userdata, setuserdata, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}