const mongoose = require("mongoose");
const WeeklyPlan = require("./WeeklyPlan");

const monthlyPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

monthlyPlanSchema.virtual("progress").get(async function () {
  const weeks = await WeeklyPlan.find({ month: this._id, user: this.user });
  if (!weeks.length) return 0;

  let total = 0;
  for (const week of weeks) {
    const todos = await require("./Todo").find({ week: week._id, user: this.user });
    if (!todos.length) continue;
    const completed = todos.filter(t => t.completed).length;
    total += (completed / todos.length) * 100;
  }

  return Math.round(total / weeks.length);
});

module.exports = mongoose.model("MonthlyPlan", monthlyPlanSchema);
