const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Todo = require("./models/Todo");
const WeeklyPlan = require("./models/WeeklyPlan");
const MonthlyPlan = require("./models/MonthlyPlan");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "jsx");
app.engine("jsx", require("express-react-views").createEngine());

// --- MongoDB ---
mongoose.connect("mongodb://localhost:27017/todoApp");

// --- Sessions ---
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/todoApp" }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId || null;
  next();
});

// --- Authentication ---
app.get("/register", (req, res) => res.render("register"));
app.post("/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    req.session.userId = user._id;
    res.redirect("/");
  } catch (err) {
    res.send("Error registering user");
  }
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.send("Invalid username or password");

  const match = await user.comparePassword(req.body.password);
  if (!match) return res.send("Invalid username or password");

  req.session.userId = user._id;
  res.redirect("/");
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// --- Auth Middleware ---
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

// --- Helper functions ---
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getOrCreateMonthlyPlan(userId) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let monthlyPlan = await MonthlyPlan.findOne({ month, year, user: userId });
  if (!monthlyPlan) {
    monthlyPlan = await MonthlyPlan.create({
      title: `${now.toLocaleString("default", { month: "long" })} ${year}`,
      month,
      year,
      user: userId
    });
  }
  return monthlyPlan;
}

async function getOrCreateWeeklyPlan(monthlyPlan, userId) {
  const weekStart = getWeekStart(new Date());

  let weeklyPlan = await WeeklyPlan.findOne({ weekStart, month: monthlyPlan._id, user: userId });
  if (!weeklyPlan) {
    weeklyPlan = await WeeklyPlan.create({
      title: `Week of ${weekStart.toDateString()}`,
      weekStart,
      month: monthlyPlan._id,
      user: userId
    });
  }
  return weeklyPlan;
}

// --- Routes ---
app.get("/", requireAuth, async (req, res) => {
  const monthlyPlan = await getOrCreateMonthlyPlan(req.session.userId);

  let weeklyPlan;
  if (req.query.weekId) {
    weeklyPlan = await WeeklyPlan.findById(req.query.weekId);
  }
  if (!weeklyPlan) {
    weeklyPlan = await getOrCreateWeeklyPlan(monthlyPlan, req.session.userId);
  }

  const todos = await Todo.find({ week: weeklyPlan._id, user: req.session.userId }).sort({ createdAt: -1 });
  const weeksInMonth = await WeeklyPlan.find({ month: monthlyPlan._id, user: req.session.userId }).sort({ weekStart: 1 });

  res.render("index", {
    todos,
    monthlyPlan,
    weeklyPlan,
    weeksInMonth
  });
});

app.post("/add", requireAuth, async (req, res) => {
  const monthlyPlan = await getOrCreateMonthlyPlan(req.session.userId);
  const weeklyPlan = await getOrCreateWeeklyPlan(monthlyPlan, req.session.userId);

  await Todo.create({ text: req.body.text, week: weeklyPlan._id, user: req.session.userId });
  res.redirect("/");
});

app.post("/toggle/:id", requireAuth, async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (todo) {
    todo.completed = !todo.completed;
    await todo.save();
  }
  res.redirect("back");
});

app.post("/edit/:id", requireAuth, async (req, res) => {
  await Todo.findByIdAndUpdate(req.params.id, { text: req.body.text });
  res.redirect("back");
});

app.post("/delete/:id", requireAuth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.redirect("back");
});

app.listen(3000, () => console.log("Server running on port 3000"));
