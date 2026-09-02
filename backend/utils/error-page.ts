export function renderErrorPage(): string {

  return `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Smart Stock Savvy - Server Error
  </title>

  <style>

    body {

      margin: 0;

      min-height: 100vh;

      display: flex;

      align-items: center;

      justify-content: center;

      font-family:
        Arial,
        Helvetica,
        sans-serif;

      background: #f8fafc;

      color: #0f172a;

    }

    .container {

      max-width: 600px;

      padding: 40px;

      text-align: center;

    }

    h1 {

      font-size: 48px;

      margin-bottom: 12px;

    }

    p {

      color: #64748b;

      line-height: 1.6;

    }

  </style>

</head>

<body>

  <main class="container">

    <h1>500</h1>

    <h2>Something went wrong</h2>

    <p>
      Smart Stock Savvy encountered
      an unexpected server error.
      Please try again later.
    </p>

  </main>

</body>

</html>
`;

}
