import { useState,useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import AddPost from './AddPost';
import './App.scss';
import LogInForm from './LogIn';
import Profile from './Profile';
import SignUpForm from './SignUp';

function App() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('All')
  const [allPosts, setAllPosts] = useState<any[]>(()=> {
    const savedPosts = localStorage.getItem('allPosts')
    if (savedPosts !== null) {
      return JSON.parse(savedPosts)
    }
    return []

  });
  useEffect(()=>{
    localStorage.setItem('allPosts', JSON.stringify(allPosts))
  },[allPosts])
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  function openHumburger(e: React.MouseEvent) {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  }
  function closeHumburger(e: React.MouseEvent) {
      if (e) {
    e.stopPropagation();
  }
    setIsMenuOpen(false);
  }
  const handleAddPost = (newPost: any) => {
    setAllPosts((prev) => [newPost, ...prev]);
  };
  let filteredPosts: any[]
  if (filter === 'All') {
    filteredPosts = allPosts
  }
  else {
    filteredPosts = allPosts.filter((post: any) => post.tag === filter)
  }
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app">
            <div className="headerMobile">
              <nav className={`navMobile ${isMenuOpen ? 'active' : ''}`}>
                <div className="header-right">
                  <div className="mobileButtons">
                    <button
                      onClick={(e) => {
                        closeHumburger(e)
                        navigate("/addPost");
                      }}
                    >
                      Add post
                    </button>
                    <button onClick={() => navigate("/signUp")}>Account</button>
                  </div>
                </div>
                {/* <a href="/" onClick={closeHumburger}>Home</a>
                <a href="/addPost" onClick={closeHumburger}>Create</a> */}
              </nav>

              {/* 👈 КЛИК = Toggle */}
              <button className="hamburger" onClick={openHumburger}>
                {isMenuOpen ? '✕' : '☰'} {/* Меняем иконку */}
              </button>
            </div>
            <header className="header">
              <div className="logo">Lumina</div>
              <nav className="nav">
                <a className="active">Explore</a>
                {/* <a>Trending</a>
                <a>Stories</a>
                <a>Library</a> */}
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
                  {filteredPosts.map((post, index) => (
                    <div key={index} className="post-item">
                      <img src={post.image} alt={post.title} className="featured-img" />
                      <span className="badge">{post.tag}</span>
                      <h1 className="post-title">{post.title}</h1>
                      <p>{post.text}</p>
                      <div className="featured-footer">
                        <span>
                          {post.authorName} · {
                            post.createdAt?.seconds
                              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                              : new Date(post.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>

                  ))}



                </div>

              </div>

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
      <Route
        path="/addPost"
        element={<AddPost onAddPost={handleAddPost} />}
      />
      <Route
        path="/signUp"
        element={<SignUpForm />}
      />
      <Route
        path="/logIn"
        element={<LogInForm />}
      />
      <Route
        path="/profile"
        element={<Profile />}
      />
    </Routes>

  );
}

export default App;