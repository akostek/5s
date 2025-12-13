import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { loginWithKeycloak } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const effectRan = React.useRef(false);

    useEffect(() => {
        if (effectRan.current) return;

        const code = searchParams.get('code');
        if (code) {
            effectRan.current = true;
            loginWithKeycloak(code)
                .then(() => {
                    navigate('/dashboard');
                })
                .catch((err) => {
                    console.error('Login failed', err);
                    setError('Giriş başarısız oldu. Lütfen tekrar deneyin.');
                    effectRan.current = false; // Allow retry on error if needed, though code is likely invalid now
                });
        } else {
            setError('Giriş kodu bulunamadı.');
        }
    }, [searchParams, loginWithKeycloak, navigate]);

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <h3>Hata</h3>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Tekrar Dene</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h3>Giriş yapılıyor, lütfen bekleyin...</h3>
        </div>
    );
};

export default CallbackPage;
