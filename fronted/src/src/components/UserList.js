import React from 'react';

const UserList = ({ users, currentUser }) => {
  return (
    <div className="card">
      <h3>Online Users ({users.length})</h3>
      <ul className="user-list">
        {users.map(userId => (
          <li key={userId} className="user-item">
            <div className={`user-status ${userId === currentUser?.id ? 'screen-sharing' : ''}`} />
            <span>
              {userId === currentUser?.id ? 'You' : `User ${userId.slice(0, 8)}`}
            </span>
          </li>
        ))}
      </ul>
      
      {users.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
          No other users online
        </p>
      )}
    </div>
  );
};

export default UserList;
