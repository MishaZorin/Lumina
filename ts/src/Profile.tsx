import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import { auth } from './firebase';
import './profile.scss'
import { useLumina } from './Context';

export default function SignUpForm() {
    const navigate = useNavigate();
    const { userName, setUserName } = useLumina()
    const { email, setEmail } = useLumina()
    const [open, setOpen] = useState<boolean>(false);
    // const { activeWidgets, setActiveWidgets } = useWidget()
    // const { email, setEmail } = useWidget()
    // const [username, setUsername] = useState('')
    // const [avatar, setAvatar] = useState(null)
    // const { taskDone, setTaskDone } = useWidget()

    // useEffect(() => {
    //     const savedName = localStorage.getItem("username")
    //     const savedAvatar = localStorage.getItem("avatar")
    //     const savedEmail = localStorage.getItem("email")



    //     if (savedName) setUsername(savedName)
    //     if (savedEmail) setEmail(savedEmail)

    //     if (savedAvatar) setAvatar(savedAvatar)
    // }, [])





    return (
        <div className="container">

            <div className="profile-header">
                <div className="avatar">
                    {/* <img src={avatar} alt="avatar" /> */}
                </div>

                <div className="user-info">
                    <h2>{userName}</h2>
                    <p>{email}</p>

                    {/* NEW: stats */}
                    <div className="stats">
                        <div><strong>24</strong><span>Posts</span></div>
                        <div><strong>1.2k</strong><span>Followers</span></div>
                        <div><strong>3.4k</strong><span>Likes</span></div>
                    </div>
                </div>
            </div>

            <div className="grid">

                <div className="card">
                    <h3>Account</h3>
                    <p>Manage your personal info and profile settings</p>

                    <button className="button" onClick={() => setOpen(true)}>
                        Edit profile
                    </button>
                    

                    {open && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <button onClick={() => setOpen(false)}>Close</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* NEW CARD */}
                <div className="card highlight">
                    <h3>Your Activity</h3>
                    <p>Last post: 2 days ago</p>
                    <p>Most popular: “Design Beyond Screens”</p>
                </div>

            </div>

            <div className="logout">
                <button onClick={() => navigate('/')}>Back to app</button>
            </div>

        </div>




    );
}
