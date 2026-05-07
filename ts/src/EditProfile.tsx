import  { useState } from 'react';
import './EditProfile.scss'; 

const ProfileModule = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="container">
      <button className="button" onClick={() => setOpen(true)}>
        Edit profile
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>

          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <p>Здесь может быть ваша форма редактирования.</p>
            
            <button className="close-button" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileModule;