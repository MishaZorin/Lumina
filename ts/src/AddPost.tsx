import { useNavigate } from "react-router-dom";
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "./Addpost.scss";

import { useState,  useRef } from "react";

interface Post {
    title: string;
    image: string;
    text: string;
    tag: string;
    authorName: string
    createdAt: any

}
interface AddPostProps {
    onAddPost: (post: Post) => void;
}


function AddPost({ onAddPost }: AddPostProps) {
    const [textValue, setTextValue] = useState("");
    const [titleValue, setTitleValue] = useState("");
    const [imageValue, setImageValue] = useState(""); // ← ОСТАЕТСЯ
    const [tagValue, setTagValue] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const createNewPost = async () => {
        if (!auth.currentUser || !imageValue) {
            alert("Заполни все поля!");
            return;
        }

        if (!titleValue.trim() || !textValue.trim()) {
            alert("Заголовок и текст не могут быть пустыми!");
            return;
        }

        try {
            const name = auth.currentUser.displayName || "Anonymous";

            // ✅ САХРАНЯЕМ base64 ПРЯМО В FIRESTORE
            await addDoc(collection(db, "posts"), {
                title: titleValue,
                text: textValue,
                image: imageValue, // ← base64 строка
                tag: tagValue || "General",
                authorId: auth.currentUser.uid,
                authorName: name,
                createdAt: serverTimestamp(),
                likes: 0
            });

            alert("✅ Опубликовано!");

            onAddPost({
                title: titleValue,
                image: imageValue,
                text: textValue,
                tag: tagValue,
                authorName: name,
                createdAt: new Date()
            });

            // Сброс формы
            setTextValue("");
            setTitleValue("");
            setImageValue("");
            setTagValue("");
            if (fileRef.current) fileRef.current.value = "";

            navigate("/");

        } catch (error: any) {
            console.error("Ошибка:", error);
            alert("Ошибка: " + error.message);
        }
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="logo">Lumina</div>

                <nav className="nav">
                    <a>Explore</a>
                    <a>Trending</a>
                    <a className="active">Create</a>
                    <a>Library</a>
                </nav>

                <div className="header-right">
                    <input className="search" placeholder="Search..." />
                    <div className="avatar">
                        <button onClick={() => navigate("/")}>Back</button>
                    </div>
                </div>
            </header>

            {/* Page */}
            <div className="container">
                <div className="create-post">
                    <h1>Create New Post</h1>

                    <div className="form">
                        <input
                            className="input title"
                            placeholder="Post title..."
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                        />

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                // 🚫 ПРОВЕРЯЕМ РАЗМЕР ФАЙЛА (500KB макс)
                                if (file.size > 500 * 1024) {
                                    alert("📱 Выберите картинку поменьше (макс 500KB)");
                                    e.target.value = "";
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setImageValue(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                        <textarea
                            className="textarea"
                            placeholder="Write your story..."
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                        />

                        <select
                            name="tag"
                            value={tagValue}
                            onChange={(e) => setTagValue(e.target.value)}
                        >
                            <option value="" disabled>Select a tag...</option>
                            <option value="Web3">Web3</option>
                            <option value="AI Ethics">AI Ethics</option>
                            <option value="Typography">Typography</option>
                            <option value="All">All</option>
                        </select>

                        <div className="actions">
                            <button className="secondary">Save Draft</button>
                            <button className="primary" onClick={createNewPost}>
                                Publish
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="card">
                        <h3>Writing Tips</h3>
                        <ul>
                            <li>Keep title clear and catchy</li>
                            <li>Use short paragraphs</li>
                            <li>Add meaningful tags</li>
                        </ul>
                    </div>

                    <div className="card">
                        <h4>Preview</h4>
                        <p>Your post preview will appear here.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default AddPost;