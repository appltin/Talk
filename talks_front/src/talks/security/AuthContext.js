import { createContext, useContext, useState } from "react";
import axios from 'axios'
import { getAvatarAndUerId, getUserInformation, executeAuthenticationService } from '../api/TalksApiService'

//1: Create a Context
export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)


//2: Share the created context with other components
export default function AuthProvider({ children }) {

    //3: Put some state in the context
    const [isAuthenticated, setAuthenticated] = useState(false)
    const [username, setUsername] = useState(null)
    const [userId, setUserId] = useState(null)
    const [avatar, setAvatar] = useState(null)
    const [starredItems, setStarredItems] = useState({}); 

    // 設置 Axios 攔截器
    function setAuthInterceptor(token) {
        axios.interceptors.request.use(
            config => {
                config.headers['Authorization'] = `Bearer ${token}`;
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }

    async function login(username, password) {
        try {
            const response = await executeAuthenticationService(username, password);
            console.log(response)
            
            if (response.status === 200) {
                const token = response.data.token
                setAuthInterceptor(token);
                setAuthenticated(true);

                // 取得用戶頭像和id
                const user = await getUserInformation(username);
                setUsername(username);
                setUserId(user.userId)
                setAvatar(user.avatar)

                return true;
                
            } else {
                setAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Login failed:', error);
            setAuthenticated(false);
            return false;
        }
    }



    function logout() {
        // 清除本地儲存的 Token
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');

        // 可選：清除 Axios 攔截器
        axios.interceptors.request.use(
            config => {
                config.headers['Authorization'] = '';
                return config;
            }
        );
        
        setAuthenticated(false)
        setUsername(null)
        
    }

    return (
        <AuthContext.Provider value={ {isAuthenticated, login, logout, username, userId, avatar, starredItems, setStarredItems, setAuthInterceptor}  }>
            {children}
        </AuthContext.Provider>
    )
} 