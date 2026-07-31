const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

class AuthService {
  async generateTokens(user) {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async registerUser(userData) {
    const { name, email, password, role, phone, address } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    // Create user in the database
    const user = await userRepository.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      address
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Prepare clean response (remove password & refresh token)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt
    };

    return { user: userResponse, token: accessToken, refreshToken };
  }

  async loginUser(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Verify hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address
    };

    return { user: userResponse, token: accessToken, refreshToken };
  }

  async refreshAccessToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    try {
      const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'merch_refresh_secret_jwt_key_88472910384729'
      );

      const user = await userRepository.findById(decoded._id);
      if (!user) {
        throw new ApiError(401, "Invalid refresh token: User not found");
      }

      if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or has already been used");
      }

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      };
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid or expired refresh token");
    }
  }

  async logoutUser(userId) {
    const user = await userRepository.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    return true;
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return true to prevent email enumeration attack
      return { message: "If an account with that email exists, reset instructions have been generated." };
    }

    // Generate random 6-digit pin / reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save({ validateBeforeSave: false });

    console.log(`[AUTH-DEBUG] Password Reset Token generated for ${email}: ${resetToken}`);

    return {
      message: "Reset token generated successfully",
      resetToken, // Included for placeholder development ease
    };
  }

  async resetPassword(resetToken, newPassword) {
    if (!resetToken || !newPassword) {
      throw new ApiError(400, "Reset token and new password are required");
    }

    const user = await userRepository.findByResetToken(resetToken);

    if (!user) {
      throw new ApiError(400, "Password reset token is invalid or has expired");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Force re-login on reset
    await user.save();

    return { message: "Password updated successfully. Please login with your new password." };
  }
}

module.exports = new AuthService();

