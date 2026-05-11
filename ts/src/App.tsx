import { useState, useEffect, useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import AddPost from './AddPost';
import './App.scss';
import LogInForm from './LogIn';
import Profile from './Profile';
import SignUpForm from './SignUp';

interface Comment {
  id?: string;
  comment: string;
  authorName: string;
  createdAt: any;
  likes?: number;
}

interface Post {
  id: string;
  title: string;
  text: string;
  image: string;
  tag: string;
  authorName: string;
  createdAt: any;
}

function App() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const [comments, setComments] = useState<Comment[]>([]); // ✅ Убрали хардкод
  const [commentsValue, setCommentsValue] = useState<string>('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ✅ Загрузка ПОСТОВ
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const posts = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Post[];
      setAllPosts(posts);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Загрузка КОММЕНТАРИЕВ
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const commentsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      setComments(commentsData);
    });
    return () => unsubscribe();
  }, []);

  // ✅ ИСПРАВЛЕННАЯ функция создания комментария
  const createComment = async () => {
    if (!auth.currentUser) {
      alert("⚠️ Необходимо авторизоваться!");
      navigate("/logIn");
      return;
    }
    
    if (!commentsValue.trim()) {
      alert("❌ Комментарий не может быть пустым!");
      return;
    }
    
    try {
      const name = auth.currentUser.displayName || "Anonymous";
      await addDoc(collection(db, "comments"), {
        comment: commentsValue.trim(),
        authorName: name,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setCommentsValue(''); // ✅ Очищаем поле
      // alert("✅ Комментарий опубликован!");
    } catch (error: any) {
      console.error("Ошибка:", error);
      alert("❌ Ошибка: " + error.message);
    }
  };

  function openHumburger(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  }

  function closeHumburger(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setIsMenuOpen(false);
  }

  const handleAddPost = async (newPost: any) => {
    await addDoc(collection(db, 'posts'), newPost);
  };

  const filteredPosts = useMemo(() => {
    if (filter === 'All') return allPosts;
    return allPosts.filter((post) => post.tag === filter);
  }, [allPosts, filter]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            {/* Мобильное меню */}
            <div className="headerMobile">
              <nav className={`navMobile ${isMenuOpen ? 'active' : ''}`}>
                <div className="header-right">
                  <div className="mobileButtons">
                    <button
                      onClick={(e) => {
                        closeHumburger(e);
                        navigate("/addPost");
                      }}
                    >
                      Add post
                    </button>
                    <button onClick={() => navigate("/signUp")}>Account</button>
                  </div>
                </div>
              </nav>
              <button className="hamburger" onClick={openHumburger}>
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>

            {/* Десктопный хедер */}
            <header className="header">
              <div className="logo">Lumina</div>
              <nav className="nav">
                <a className="active">Explore</a>
              </nav>
              <div className="header-right">
                <div className="avatar">
                  <button onClick={() => navigate("/addPost")}>Add post</button>
                  <button onClick={() => navigate("/signUp")}>Account</button>
                </div>
              </div>
            </header>

            <div className="container">
              <div className="main">
                <div className="featured">
                  {filteredPosts.length === 0 ? (
                    <div className="no-posts">
                      <h2>Нет постов</h2>
                      <p>Будьте первым, кто создаст пост!</p>
                      <button onClick={() => navigate("/addPost")}>
                        Создать пост
                      </button>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="post-item">
                        <img src={post.image} alt={post.title} className="featured-img" />
                        <span className="badge">{post.tag}</span>
                        <h1 className="post-title">{post.title}</h1>
                        <p>{post.text}</p>
                        <div className="featured-footer">
                          <span>
                            {post.authorName} ·{' '}
                            {post.createdAt?.seconds
                              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                              : new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ✅ ОТДЕЛЬНЫЙ БЛОК КОММЕНТАРИЕВ */}
              <div className="comments-section">
                <h3>💬 Комментарии ({comments.length})</h3>
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>Пока нет комментариев...</p>
                    <p>Будьте первым!</p>
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.map((comm) => (
                      <div key={comm.id} className="comment-item">
                        <p>{comm.comment}</p>
                        <div className="comment-meta">
                          <small>{comm.authorName}</small>
                          <small>·</small>
                          <small>
                            {comm.createdAt?.seconds
                              ? new Date(comm.createdAt.seconds * 1000).toLocaleDateString()
                              : 'недавно'}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* ✅ ОДНА ФОРМА КОММЕНТАРИЯ */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createComment();
                }} className="comment-form">
                  <input 
                    type="text" 
                    placeholder="Напишите комментарий..." 
                    value={commentsValue}
                    onChange={(e) => setCommentsValue(e.target.value)}
                    maxLength={500}
                  />
                  <button type="submit" disabled={!commentsValue.trim() || !auth.currentUser}>
                    {auth.currentUser ? 'Опубликовать' : 'Войдите'}
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <aside className="sidebar">
                <div className="card">
                  <h3>Lumina</h3>
                  <p>
                    A space dedicated to the high-end digital craftsman.
                    We explore technology, design, and philosophy.
                  </p>
                  <a
                    href="t.me/the_frontend_way"
                    className="secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow Community
                  </a>
                </div>
                <div className="card">
                  <h4>Explore Topics</h4>
                  <div className="tags">
                    <span onClick={() => setFilter('AI Ethics')}>AI Ethics</span>
                    <span onClick={() => setFilter('Web3')}>Web3</span>
                    <span onClick={() => setFilter('Typography')}>Typography</span>
                    <span onClick={() => setFilter('Minimalism')}>Minimalism</span>
                    <span onClick={() => setFilter('All')}>All</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        }
      />
      <Route path="/addPost" element={<AddPost onAddPost={handleAddPost} />} />
      <Route path="/signUp" element={<SignUpForm />} />
      <Route path="/logIn" element={<LogInForm />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;