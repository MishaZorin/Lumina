import { useState, useEffect, useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import AddPost from './AddPost';  // ✅ Без пропсов!
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
  likes?: number;
}

function App() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('All');
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsValue, setCommentsValue] = useState<string>('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [likes, setLikes] = useState(0)
  
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const posts = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Post[];
      setAllPosts(posts);
      console.log(`📥 Загружено постов: ${posts.length}`);
    }, (error) => {
      console.error('Ошибка загрузки постов:', error);
    });
    return () => unsubscribe();
  }, [refreshKey]);

 const toggleLike = async (postId: string, currentLikes: number) => {
  if (!auth.currentUser) {
    alert("⚠️ Нужно войти, чтобы ставить лайки!");
    return;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    // Обновляем число лайков в БД (увеличиваем на 1)
    await updateDoc(postRef, {
      likes: (currentLikes || 0) + 1
    });
  } catch (error) {
    console.error("Ошибка при лайке:", error);
  }
};
  useEffect(() => {
    const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const commentsData = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      setComments(commentsData);
    }, (error) => {
      console.error('Ошибка загрузки комментариев:', error);
    });
    return () => unsubscribe();
  }, [refreshKey]);

  // ✅ Создание комментария
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
      setCommentsValue('');
    } catch (error: any) {
      console.error("Ошибка:", error);
      alert("❌ Ошибка: " + error.message);
    }
  };

  // ✅ Принудительное обновление данных
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    setAllPosts([]);
    setComments([]);
  };

  function openHumburger(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  }

  function closeHumburger(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setIsMenuOpen(false);
  }



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
                    <button onClick={(e) => {
                      closeHumburger(e);
                      navigate("/addPost");
                    }}>
                      ➕ Add post
                    </button>
                    <button onClick={() => {
                      closeHumburger();
                      navigate("/signUp");
                    }}>
                      👤 Account
                    </button>
                    <button onClick={() => {
                      closeHumburger();
                      navigate("/logIn");
                    }}>
                      🔐 Log In
                    </button>
                  </div>
                </div>
              </nav>
              <button className="hamburger" onClick={openHumburger}>
                {isMenuOpen ? '✕' : '☰'}
              </button>
            </div>

            {/* Десктопный хедер */}
            <header className="header">
              <div className="logo" onClick={() => navigate("/")}>Lumina</div>
              <nav className="nav">
                <a className="active" onClick={() => setFilter('All')}>Explore</a>
              </nav>
              <div className="header-right">
                <div className="avatar">
                  <button onClick={() => navigate("/addPost")}>➕ Add post</button>
                  <button onClick={() => navigate("/signUp")}>👤 Account</button>
                </div>
              </div>
            </header>

            {/* Кнопка обновления */}
            <div className="refresh-controls">
              <button
                onClick={refreshData}
                className="refresh-btn"
              >
                🔄 Обновить ({allPosts.length} постов, {comments.length} комм.)
              </button>
            </div>

            <div className="container">
              <div className="main">
                <div className="featured">
                  {filteredPosts.length === 0 ? (
                    <div className="no-posts">
                      <h2>{filter === 'All' ? 'Нет постов' : `Нет постов с тегом "${filter}"`}</h2>
                      <p>{filter === 'All' ? 'Будьте первым!' : 'Попробуйте другой тег'}</p>
                      <button onClick={() => navigate("/addPost")}>
                        ➕ Создать первый пост
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
                              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('ru-RU')
                              : new Date(post.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  <button
    onClick={() => toggleLike(post.id, post.likes || 0)}
    style={{
      background: 'none',
      border: '2px solid',
      // Подсвечиваем, если лайки есть
      borderColor: (post.likes || 0) > 0 ? '#ff4d4d' : '#ccc',
      borderRadius: '20px',
      padding: '5px 15px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: '0.3s',
      outline: 'none'
    }}
  >
    <span style={{
      color: (post.likes || 0) > 0 ? '#ff4d4d' : '#ccc',
      fontSize: '20px',
      transition: '0.3s'
    }}>
      ❤
    </span>

    <span style={{
      color: (post.likes || 0) > 0 ? '#ff4d4d' : '#666',
      fontWeight: 'bold',
      fontSize: '16px'
    }}>
      {post.likes || 0}
    </span>
  </button>
</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Комментарии */}
              <div className="comments-section">
                <h3>💬 Комментарии ({comments.length})</h3>
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>Пока нет комментариев...</p>
                    <p>Будьте первым! 👆</p>
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.map((comm) => (
                      <div key={comm.id || Math.random()} className="comment-item">
                        <p>{comm.comment}</p>
                        <div className="comment-meta">
                          <small>{comm.authorName}</small>
                          <small>·</small>
                          <small>
                            {comm.createdAt?.seconds
                              ? new Date(comm.createdAt.seconds * 1000).toLocaleDateString('ru-RU')
                              : 'недавно'}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                    disabled={!auth.currentUser}
                  />
                  <button
                    type="submit"
                    disabled={!commentsValue.trim() || !auth.currentUser}
                  >
                    {auth.currentUser ? '💬 Опубликовать' : '🔐 Войдите'}
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
                  <a href="t.me/the_frontend_way" className="secondary" target="_blank" rel="noopener noreferrer">
                    👥 Follow Community
                  </a>
                </div>
                <div className="card">
                  <h4>Explore Topics</h4>
                  <div className="tags">
                    <span
                      className={filter === 'All' ? 'active' : ''}
                      onClick={() => setFilter('All')}
                    >
                      All ({allPosts.length})
                    </span>
                    <span
                      className={filter === 'AI Ethics' ? 'active' : ''}
                      onClick={() => setFilter('AI Ethics')}
                    >
                      🤖 AI Ethics
                    </span>
                    <span
                      className={filter === 'Web3' ? 'active' : ''}
                      onClick={() => setFilter('Web3')}
                    >
                      ₿ Web3
                    </span>
                    <span
                      className={filter === 'Typography' ? 'active' : ''}
                      onClick={() => setFilter('Typography')}
                    >
                      ✍ Typography
                    </span>
                    <span
                      className={filter === 'Minimalism' ? 'active' : ''}
                      onClick={() => setFilter('Minimalism')}
                    >
                      🎨 Minimalism
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        }
      />

      {/* ✅ БЕЗ onAddPost - ОДИНОЧНОЕ сохранение! */}
      <Route path="/addPost" element={<AddPost />} />
      <Route path="/signUp" element={<SignUpForm />} />
      <Route path="/logIn" element={<LogInForm />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;