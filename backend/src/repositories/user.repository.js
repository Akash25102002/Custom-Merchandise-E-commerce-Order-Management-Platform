const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

const getJSONUsers = () => {
  ensureDataFile();
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(content || '[]');
};

const writeJSONUsers = (users) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

const wrapUserMethods = (user) => {
  if (!user) return null;
  const wrapped = {
    ...user,
    isPasswordCorrect: async function (password) {
      return await bcrypt.compare(password, user.password);
    },
    generateAccessToken: function () {
      return jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.ACCESS_TOKEN_SECRET || 'merch_secret_jwt_key_983749823749823',
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
      );
    },
    generateRefreshToken: function () {
      return jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET || 'merch_refresh_secret_jwt_key_88472910384729',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
      );
    },
    save: async function () {
      if (process.env.DB_MODE === 'json') {
        const users = getJSONUsers();
        const index = users.findIndex(u => u._id === user._id);
        if (index !== -1) {
          if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
          }
          users[index] = {
            ...users[index],
            refreshToken: this.refreshToken,
            resetPasswordToken: this.resetPasswordToken,
            resetPasswordExpires: this.resetPasswordExpires,
            password: this.password,
            updatedAt: new Date().toISOString()
          };
          writeJSONUsers(users);
        }
      }
      return this;
    }
  };
  return wrapped;
};

class UserRepository {
  async findByEmail(email) {
    if (process.env.DB_MODE === 'json') {
      const users = getJSONUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return wrapUserMethods(user);
    }
    return await User.findOne({ email });
  }

  async findById(id) {
    if (process.env.DB_MODE === 'json') {
      const users = getJSONUsers();
      const user = users.find(u => u._id === id);
      if (!user) return null;
      return wrapUserMethods(user);
    }
    return await User.findById(id).select('-password');
  }

  async findByResetToken(token) {
    if (process.env.DB_MODE === 'json') {
      const users = getJSONUsers();
      const user = users.find(u => u.resetPasswordToken === token && new Date(u.resetPasswordExpires) > new Date());
      if (!user) return null;
      return wrapUserMethods(user);
    }
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }

  async create(userData) {
    if (process.env.DB_MODE === 'json') {
      const users = getJSONUsers();
      
      // Hash password manually for local JSON mode
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const newUser = {
        _id: 'usr_' + Math.random().toString(36).substring(2, 11),
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'customer',
        phone: userData.phone || '',
        address: userData.address || { street: '', city: '', state: '', zipCode: '', country: '' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(newUser);
      writeJSONUsers(users);
      
      return wrapUserMethods(newUser);
    }
    return await User.create(userData);
  }

  async deleteById(id) {
    if (process.env.DB_MODE === 'json') {
      const users = getJSONUsers();
      const filtered = users.filter(u => u._id !== id);
      writeJSONUsers(filtered);
      return true;
    }
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserRepository();
