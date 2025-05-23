import React from 'react';

const Home = () => {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Recipe Share</h1>
            <p style={styles.subtitle}>
                Your go-to app for discovering and sharing amazing recipes.
            </p>
            <button style={styles.button}>Get Started</button>
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
    button: {
        padding: '0.8rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#ff6f61',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Home;