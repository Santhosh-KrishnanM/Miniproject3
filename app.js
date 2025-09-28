const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const User = require('./User');
const admin = require('./admin');
const Booking = require('./Booking');
const Destination = require('./Destination');
const Favorite = require('./Favorite');
const Activity = require('./Activity');
const Image = require('./Image');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, email, phone, address, password } = req.body;
    if (!username || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // TODO: Use password hashing in production!
    const user = new User({ username, email, phone, address, password });
    await user.save();

    res.status(201).json({
      message: 'User registered!',
      user: {
        _id: user._id,          // ✅ return MongoDB ObjectId
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Error registering user', error: err });
    }
  }
});


// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,          // ✅ include MongoDB ID
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true } // return updated document
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Booking routes
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, destination, startDate, endDate, travelers } = req.body;

    const booking = new Booking({
      userId,
      destination,
      startDate,
      endDate,
      travelers
    });

    await booking.populate("destination");
    await booking.save();

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});


// ✅ Get bookings for a specific user
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch bookings and include destination details
    const bookings = await Booking.find({ userId })
      .populate("destination"); 

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});


// Destination routes
app.post('/destinations', async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.status(201).json({ message: 'Destination created!', destination });
  } catch (err) {
    res.status(500).json({ message: 'Error creating destination', error: err });
  }
});

app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find({});
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});


// Favorite routes
app.post('/favorites', async (req, res) => {
  try {
    const favorite = new Favorite(req.body);
    await favorite.save();
    res.status(201).json({ message: 'Favorite added!', favorite });
  } catch (err) {
    res.status(500).json({ message: 'Error adding favorite', error: err });
  }
});

app.get('/favorites/:userId', async (req, res) => {
  const favorites = await Favorite.find({ userId: req.params.userId }).populate('destinationId');
  res.json(favorites);
});

// Activity routes
app.post('/activities', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json({ message: 'Activity logged!', activity });
  } catch (err) {
    res.status(500).json({ message: 'Error logging activity', error: err });
  }
});

app.get('/activities/:userId', async (req, res) => {
  const activities = await Activity.find({ userId: req.params.userId });
  res.json(activities);
});

// Image routes
app.post('/images', async (req, res) => {
  try {
    const image = new Image(req.body);
    await image.save();
    res.status(201).json({ message: 'Image uploaded!', image });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading image', error: err });
  }
});

app.get('/images', async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const images = await Image.find(filter);
  res.json(images);
});

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});

const Page = require('./Page');

// Create a new page
app.post('/pages', async (req, res) => {
  try {
    const page = new Page(req.body);
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: 'Error creating page', error: err });
  }
});

// Get all pages
app.get('/pages', async (req, res) => {
  const pages = await Page.find();
  res.json(pages);
});

// Get a single page by slug
app.get('/pages/:slug', async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (page) res.json(page);
  else res.status(404).json({ message: 'Page not found' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', dbState: mongoose.connection.readyState });
});