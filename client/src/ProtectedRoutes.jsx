import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from './api/axios';

const ProtectedRoute = ({ isAllowed, redirectTo = "/acceso", requireToken = false }) => {
    const [isValidating, setIsValidating] = useState(requireToken);
    const [isValid, setIsValid] = useState(false);
    const location = useLocation(); 
    
    const currentToken = localStorage.getItem('token');

    useEffect(() => {
        if (!requireToken) {
            setIsValidating(false);
            return;
        }

        const verify = async () => {
            if (!currentToken) {
                setIsValid(false);
                setIsValidating(false);
                return;
            }
            try {
                await axios.get('/validate', {
                    headers: { Authorization: `Bearer ${currentToken}` }
                });
                setIsValid(true);
            } catch {
                localStorage.clear();
                setIsValid(false);
            } finally {
                setIsValidating(false);
            }
        };

        verify();
    }, [currentToken, requireToken, location.pathname]);

    if (isValidating && requireToken) return <div style={styles.loaderContainer}><div style={styles.spinner}></div></div>;

    const userInStorage = JSON.parse(localStorage.getItem('user'));
    

    if (!requireToken && userInStorage && !isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }


    if ((requireToken && !isValid) || !isAllowed) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};
const styles = {
    loaderContainer: {
        position: 'fixed',   
        top: 0,
        left: 0,
        width: '100vw',       
        height: '100vh',   
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E5E7',
        zIndex: 9999          
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid rgba(45, 51, 84, 0.1)',
        borderLeftColor: '#2D3354',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '15px',
        color: '#2D3354',
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: "'Jersey 20', sans-serif"
    }
};
export default ProtectedRoute;