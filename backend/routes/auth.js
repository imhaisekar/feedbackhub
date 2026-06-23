const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../middleware/mailer');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER — Send OTP
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified) return res.status(400).json({ message: 'This email is already registered.' });

    // Delete old unverified user if exists
    if (exists && !exists.isVerified) await User.deleteOne({ email });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'user', isVerified: false });
    await user.save();

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.deleteMany({ email }); // Clear old OTPs
    await new OTP({ email, otp }).save();
    await sendOTPEmail(email, otp, name);

    res.json({ message: 'OTP sent to your email. Please verify to continue.', email });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });

    await User.updateOne({ email }, { isVerified: true });
    await OTP.deleteMany({ email });

    const user = await User.findOne({ email });
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ message: 'Email verified successfully!', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
});

// RESEND OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with this email.' });

    const otp = generateOTP();
    await OTP.deleteMany({ email });
    await new OTP({ email, otp }).save();
    await sendOTPEmail(email, otp, user.name);

    res.json({ message: 'New OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP.', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with this email.' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first.', needsVerification: true, email });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password. Please try again.' });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

module.exports = router;
