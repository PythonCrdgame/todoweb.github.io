const React = require("react");
const Layout = require("./layout");

function Login() {
  return (
    <Layout>
      <h1>Login</h1>
      <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button>Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
    </Layout>
  );
}

module.exports = Login;
