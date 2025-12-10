export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { userId, a, b, answer } = req.body || {};

  if (!userId || a == null || b == null || answer == null) {
    return res.status(400).send("Missing fields.");
  }

  const aNum = parseInt(a, 10);
  const bNum = parseInt(b, 10);
  const ansNum = parseInt(answer, 10);

  if (Number.isNaN(aNum) || Number.isNaN(bNum) || Number.isNaN(ansNum)) {
    return sendResult(res, "Incorrect answer.", false);
  }

  const correct = aNum + bNum;

  if (ansNum !== correct) {
    return sendResult(res, "Incorrect answer.", false);
  }

  // Captcha "passed" → give role
  const guildId = process.env.GUILD_ID;
  const roleId = process.env.ROLE_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !roleId || !botToken) {
    return res.status(500).send("Missing Discord bot env vars.");
  }

  const url = `https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`;

  try {
    const discordRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("Discord role error:", text);
      return sendResult(
        res,
        "Verification failed. Make sure you are in the server and the bot has Manage Roles permission.",
        false
      );
    }

    return sendResult(
      res,
      "You're verified! The role has been added. You can close this tab and return to Discord.",
      true
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send("Unexpected error while assigning role. Check logs.");
  }
}

function sendResult(res, message, success) {
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
          box-shadow: 0 15px 40px rgba(15,23,42,0.12);
          text-align: center;
        }
        h2 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        p {
          font-size: 0.95rem;
          color: #4b5563;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>${success ? "Verified ✅" : "Verification error"}</h2>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `);
}
