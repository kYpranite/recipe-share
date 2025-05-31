import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Recipe Share</h1>
            <p style={styles.subtitle}>
                Hello, {user.name}! Your go-to app for discovering and sharing amazing recipes.
            </p>
            <div style={styles.buttonContainer}>
                <button style={styles.button}>Get Started</button>
                <button 
                    style={{ ...styles.button, ...styles.logoutButton }}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        textAlign: 'center',
        color: '#333',
    },
    title: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: '1.2rem',
        marginBottom: '2rem',
    },
    buttonContainer: {
        display: 'flex',
        gap: '1rem',
    },
    button: {
        padding: '0.8rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#ff6f61',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    logoutButton: {
        backgroundColor: '#666',
    },
};

export default Home;