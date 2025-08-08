import axios from 'axios'
import { API_BASE_URL } from '../../env'

const axiosInstance = axios.create({ 
    baseURL: `${API_BASE_URL}/api/usremoterecqa`,
    timeout: 30000 
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API error", error)
        return Promise.reject(error)
    }
)

export default axiosInstance