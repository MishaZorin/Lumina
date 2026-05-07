import { auth } from './firebase';
import { useEffect, useState } from 'react'
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { useLumina } from './Context';
import './signUp.scss'


export default function LogInForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
    const { userName, setUserName } = useLumina()

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Попытка регистрации с:", email);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    navigate("/profile")
                    updateProfile(user, {
                        displayName: userName
                    });
                    console.log("Пользователь:", user.displayName);
                    // setIsSignedUp(true)
                    // localStorage.setItem("email", user.email)
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (error.code === 'auth/weak-password') {
                    alert('Пароль слишком слабый (нужно минимум 6 символов).');
                } else if (error.code === 'auth/email-already-in-use') {
                    alert('Эта почта уже занята.');
                } else if (error.code === 'auth/invalid-email') {
                    alert('Некорректный формат почты.');
                }
            });
    }



    return (

        <main>
            <div className='sectionSignUp'>
                <h1> Log In</h1>
                <form>
                    <div>
                        <label htmlFor="email-address">
                            Email address
                        </label>
                        <input type="email"

                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Email address" />

                    </div>

                    <div>
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"

                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Password"
                        />
                    </div>

                    <div>
                        <label htmlFor="username">
                            Your  Username
                        </label>
                        <input
                            type="text"

                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            placeholder=" username"
                        />
                    </div>

                    <button
                        type="submit"
                        onClick={onSubmit}
                    >
                        log In
                    </button>
                    <div className="flex-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => navigate("/")}>
                            Back to app
                        </button>
                        <button onClick={() => navigate('/login')}>already have an account?</button>
                    </div>


                </form>


            </div>
        </main>





    );
}