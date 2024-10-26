import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../model/user.js';
import { APP_CONSTANTS } from '../util/constants.js';
import catchErrors from '../util/errorUtil.js';

dotenv.config();

const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userObj = await User.findOne({ where: { email } });
    if (userObj) {
      return res.status(401).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashPassword });
    return res.status(201).json({
      msg: 'User Registration Success!',
      data: user,
      status: APP_CONSTANTS.OPERATION_SUCCESS,
    });
  } catch (error) {
    return catchErrors(error, res);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userObj = await User.findOne({ where: { email } });
    if (!userObj) {
      return res.status(404).json({ msg: 'User Not Found', status: 'FAILED' });
    }

    const passwordCheck = await bcrypt.compare(password, userObj.password);
    if (!passwordCheck) {
      return res
        .status(401)
        .json({ msg: 'Invalid Password', status: 'FAILED' });
    }

    const payload = { id: userObj.id, email: userObj.email };
    const secretkey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(payload, secretkey);

    const { username, id, createdAt, updatedAt } = userObj;
    return res.status(200).json({
      msg: 'Login success',
      token,
      data: { email, username, id, createdAt, updatedAt },
    });
  } catch (error) {
    return catchErrors(error, res);
  }
};

const getUserData = async (req, res) => {
  try {
    const { id } = req.headers['theUser'];

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.status(200).json({
      msg: 'SUCCESS',
      data: user,
    });
  } catch (err) {
    return catchErrors(err, res);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        msg: 'User not found',
        status: APP_CONSTANTS.OPERATION_FAILED,
      });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '1h',
      }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:8080/users/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Hello, You requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    };

    // Send the reset email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      msg: 'Password reset link sent to email',
      status: APP_CONSTANTS.OPERATION_SUCCESS,
    });
  } catch (error) {
    return catchErrors(error, res);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found', status: 'FAILED' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(newPassword, salt);

    user.password = hashPassword;
    await user.save();

    return res.status(200).json({
      msg: 'Password reset successful',
      status: APP_CONSTANTS.OPERATION_SUCCESS,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ msg: 'Token expired', status: 'FAILED' });
    }
    return catchErrors(error, res);
  }
};

export default {
  createUser,
  loginUser,
  getUserData,
  forgotPassword,
  resetPassword,
};