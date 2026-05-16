const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['organizer', 'attendee'],
    default: 'attendee'
  },
  refreshToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

 userSchema.methods.generateAccessToken = function() {
    const token = jwt.sign(
        { id: this._id, role: this.role ,email: this.email,username: this.username},
         process.env.JWT_SECRET, 
         { expiresIn: '1h' });
         return token;
  }

  userSchema.methods.generateRefreshToken = function() {
    const refreshToken = jwt.sign(
        { id: this._id, role: this.role ,email: this.email,username: this.username},
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
    );
    return refreshToken;
  }

module.exports = mongoose.model('User', userSchema);