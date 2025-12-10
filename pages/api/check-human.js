export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const token = req.body["cf-turnstile-response"];
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress;

  if (!token || !secret) {
    return res.status(400).send("Missing Turnstile token or secret.");
  }

  try {
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
          remoteip: ip || ""
        })
      }
    );

    const data = await verifyRes.json();

    if (!data.success) {
      console.error("Turnstile failed:", data);
      return res.status(200).send(`
        <html><body style="font-family: system-ui; text-align:center; margin-top:20vh;">
        <h2>Verification failed.</h2>
        <p>Please <a href="/human.html">go back and try again</a>.</p>
        </body></html>
      `);
    }

    // ✅ Human passed captcha → continue to Discord OAuth
    return res.redirect(302, "/api/login");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error verifying captcha.");
  }
}