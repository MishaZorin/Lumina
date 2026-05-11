import { useNavigate } from "react-router-dom";
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState, useRef } from "react";
import "./Addpost.scss";

function AddPost() {
  const [textValue, setTextValue] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const createNewPost = async () => {
    // ✅ ВАЛИДАЦИЯ
    if (!auth.currentUser) {
      alert("⚠️ Требуется авторизация!");
      navigate("/logIn");
      return;
    }
    
    if (!imageValue.trim()) {
      alert("❌ Выберите изображение!");
      return;
    }
    
    if (!titleValue.trim()) {
      alert("❌ Введите заголовок!");
      return;
    }
    
    if (!textValue.trim()) {
      alert("❌ Напишите текст поста!");
      return;
    }

    setIsLoading(true);

    try {
      const name = auth.currentUser.displayName || "Anonymous";

      // ✅ ОДИН addDoc в Firestore
      await addDoc(collection(db, "posts"), {
        title: titleValue.trim(),
        text: textValue.trim(),
        image: imageValue.trim(),
        tag: tagValue || "General",
        authorId: auth.currentUser.uid,
        authorName: name,
        createdAt: serverTimestamp(),
        
      });

      // ✅ Очистка формы
      setTextValue("");
      setTitleValue("");
      setImageValue("");
      setTagValue("");
      if (fileRef.current) fileRef.current.value = "";

      alert("🎉 Пост успешно опубликован!");
      navigate("/");

    } catch (error: any) {
      console.error("Ошибка:", error);
      alert("❌ Ошибка публикации: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Проверка размера (1MB макс)
    if (file.size > 1024 * 1024) {
      alert("📏 Изображение слишком большое! Максимум 1MB");
      e.target.value = "";
      return;
    }

    // ✅ Проверка формата
    if (!file.type.startsWith('image/')) {
      alert("🖼️ Выберите изображение!");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageValue(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="add-post-page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          ← Lumina
        </div>

        <nav className="nav">
          <a onClick={() => navigate("/")}>Explore</a>
          <a className="active">Create</a>
        </nav>

        <div className="header-right">
          <div className="avatar">
            <button onClick={() => navigate("/")}>← Back</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        <div className="create-post">
          <div className="post-header">
            <h1>✨ Create New Post</h1>
            <p>Share your story with the world</p>
          </div>

          <div className="form">
            {/* Заголовок */}
            <input
              className="input title"
              placeholder="Enter post title..."
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              maxLength={120}
            />

            {/* Изображение */}
            <div className="image-upload">
              <label className={`file-label ${imageValue ? 'has-image' : ''}`}>
                {imageValue ? (
                  <>
                    <img src={imageValue} alt="Preview" className="image-preview" />
                    <span>✅ Изображение готово</span>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">📁</div>
                    <span>Выберите изображение (макс 1MB)</span>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Текст поста */}
            <textarea
              className="textarea"
              placeholder="Write your story... Share your thoughts, ideas, or experiences."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={10}
              maxLength={3000}
            />

            {/* Теги */}
            <div className="tag-section">
              <label>Тег поста:</label>
              <select
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
                className="select-tag"
              >
                <option value="">Выберите тег...</option>
                <option value="AI Ethics">🤖 AI Ethics</option>
                <option value="Web3">₿ Web3</option>
                <option value="Typography">✍ Typography</option>
                <option value="Minimalism">🎨 Minimalism</option>
                <option value="Design">💎 Design</option>
                <option value="Technology">⚙ Technology</option>
                <option value="Philosophy">🧠 Philosophy</option>
              </select>
            </div>

            {/* Кнопки */}
            <div className="actions">
              <button 
                className="secondary" 
                onClick={() => navigate("/")}
                disabled={isLoading}
              >
                ← Cancel
              </button>
              <button 
                className="primary" 
                onClick={createNewPost}
                disabled={isLoading || !imageValue || !titleValue.trim() || !textValue.trim()}
              >
                {isLoading ? "⏳ Публикуем..." : "🚀 Publish Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="card tips">
            <h3>💡 Советы по публикации</h3>
            <ul>
              <li>📝 Заголовок до 120 символов</li>
              <li>🖼️ Изображение до 1MB (JPG, PNG)</li>
              <li>🏷️ Выберите 1 релевантный тег</li>
              <li>✍️ Текст до 3000 символов</li>
            </ul>
          </div>

          <div className="card preview">
            <h4>📱 Предпросмотр</h4>
            <div className="preview-content">
              {titleValue && (
                <>
                  <h5>{titleValue}</h5>
                  <p>{textValue.slice(0, 100)}...</p>
                  {imageValue && <div className="preview-image" style={{backgroundImage: `url(${imageValue})`}} />}
                </>
              )}
              <small>Так будет выглядеть ваш пост</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AddPost;