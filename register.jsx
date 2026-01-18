const React = require("react");
const Layout = require("./layout");

function Register() {
  return (
    <Layout>
      <h1>Register</h1>
      <form action="/register" method="POST">
        <input type="text" name="username" placeholder="Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <button>Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </Layout>
  );
}

module.exports = Register;
