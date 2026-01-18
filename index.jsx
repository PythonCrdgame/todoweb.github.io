const React = require("react");
const Layout = require("./layout");

function Index({ todos = [], monthlyPlan, weeklyPlan, weeksInMonth = [] }) {
  if (!monthlyPlan || !weeklyPlan) {
    return (
      <Layout>
        <p>Loading plans...</p>
      </Layout>
    );
  }

  const completedTodos = todos.filter(t => t.completed).length;
  const weeklyProgress = todos.length ? Math.round((completedTodos / todos.length) * 100) : 0;

  return (
    <Layout>
      {/* Month Header */}
      <section className="month-header">
        <h1>{monthlyPlan.title}</h1>
        <p className="subtitle">Monthly Plan</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${weeklyProgress}%` }}></div>
        </div>
        <p className="progress-text">{weeklyProgress}% Complete</p>
      </section>

      {/* Week Header */}
      <section className="week-header">
        <h2>{weeklyPlan.title}</h2>
        <p className="subtitle">Weekly Focus</p>

        <div className="week-navigation">
          {weeksInMonth.map(week => (
            <a
              key={week._id}
              href={`/?weekId=${week._id}`}
              className={`week-btn ${week._id.toString() === weeklyPlan._id.toString() ? "active" : ""}`}
            >
              {new Date(week.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </a>
          ))}
        </div>
      </section>

      {/* Add Todo */}
      <form action="/add" method="POST" className="add-form">
        <input type="text" name="text" placeholder="Add a task for this week" required />
        <button className="primary">Add</button>
      </form>

      {/* Todo List */}
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo._id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
            <form action={`/toggle/${todo._id}`} method="POST">
              <button className="checkbox">{todo.completed ? "✔" : ""}</button>
            </form>

            <form action={`/edit/${todo._id}`} method="POST" className="edit-form">
              <input type="text" name="text" defaultValue={todo.text} required />
              <button className="save">Save</button>
            </form>

            <form action={`/delete/${todo._id}`} method="POST">
              <button className="delete">✕</button>
            </form>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

module.exports = Index;
