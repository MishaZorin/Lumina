import { auth } from './firebase';
import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import { useLumina } from './Context';
import './signUp.scss'


export default function SignUpForm() {
    const navigate = useNavigate();
    const { email, setEmail } = useLumina();
    const { userName, setUserName } = useLumina()
    const [password, setPassword] = useState<string>('');
    // const [isSignedUp, setIsSignedUp] = useState<boolean>(false);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Попытка регистрации с:", email);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user) {
                    navigate("/profile")
                    updateProfile(user, {
                        displayName: userName
                    });
                    console.log("Пользователь создан и имя обновлено:", user.displayName);
                    // setIsSignedUp(true)
                    // localStorage.setItem("email", user.email)
                }
            })
            .catch((error) => {
                // const errorCode = error.code;
                // const errorMessage = error.message;
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
                <h1> Sign up</h1>
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
                            Create Username
                        </label>
                        <input
                            type="text"

                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            placeholder="create username"
                        />
                    </div>

                    <button
                        type="submit"
                        onClick={onSubmit}
                    >
                        Sign up
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