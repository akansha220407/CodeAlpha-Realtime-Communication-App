const users = new Map();

class User {
  constructor(username, passwordHash) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.username = username;
    this.passwordHash = passwordHash;
    this.createdAt = new Date();
  }

  static create(username, passwordHash) {
    const user = new User(username, passwordHash);
    users.set(user.id, user);
    return user;
  }

  static findByUsername(username) {
    return Array.from(users.values()).find(u => u.username === username);
  }

  static findById(id) {
    return users.get(id);
  }
}

module.exports = User;
