const React = require("react");

function Layout({ children, currentUser }) {
  return (
    <html>
      <head>
        <title>To-Do App</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <header>
          {currentUser && (
            <form action="/logout" method="POST" style={{ textAlign: "right" }}>
              <button>Logout</button>
            </form>
          )}
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

module.exports = Layout;
