export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing ?code from Discord.");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const baseUrl = process.env.BASE_URL;

  if (!clientId || !clientSecret || !redirectUri || !baseUrl) {
    return res.status(500).send("Missing required env vars.");
  }

  try {
    // 1) Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Token error:", text);
      return res.status(500).send("Error getting token from Discord.");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2) Get user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userRes.ok) {
      const text = await userRes.text();
      console.error("User error:", text);
      return res.status(500).send("Error getting user from Discord.");
    }

    const user = await userRes.json();
    const username = `${user.username}#${user.discriminator}`;

    // 3) Generate a simple math captcha
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;

    // 4) Return an HTML page with the captcha
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f5f5f7;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px 28px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 15px 40px rgba(15, 23, 42, 0.12);
          }
          h1 {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
          }
          p {
            margin: 0.35rem 0;
            font-size: 0.9rem;
            color: #4b5563;
          }
          label {
            display: block;
            margin-top: 1rem;
            font-size: 0.9rem;
            font-weight: 500;
          }
          input[type="text"] {
            width: 100%;
            margin-top: 0.35rem;
            padding: 0.55rem 0.7rem;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            font-size: 0.95rem;
          }
          button {
            margin-top: 1rem;
            width: 100%;
            padding: 0.6rem 0.8rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            background: #111827;
            color: #ffffff;
          }
          .user {
            font-size: 0.8rem;
            margin-top: 0.5rem;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Final step: human check</h1>
          <p>To complete verification, please solve this simple challenge.</p>
          <p class="user">Logged in as: <strong>${username}</strong></p>

          <form method="POST" action="${baseUrl}/api/verify">
            <input type="hidden" name="userId" value="${user.id}" />
            <input type="hidden" name="a" value="${a}" />
            <input type="hidden" name="b" value="${b}" />
            <label for="answer">What is ${a} + ${b}?</label>
            <input type="text" name="answer" id="answer" autocomplete="off" required />
            <button type="submit">Verify</button>
          </form>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Unexpected error during callback.");
  }
}
