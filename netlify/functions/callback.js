const renderCallback = ({ status, content }) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Decap CMS authorization</title>
  </head>
  <body>
    <p>Authorization ${status}.</p>
    <script>
      const content = ${JSON.stringify(content)};
      const receiveMessage = (message) => {
        if (message.data === "authorizing:github") {
          window.opener.postMessage(
            "authorization:github:${status}:" + JSON.stringify(content),
            message.origin
          );
        }
      };

      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  </body>
</html>`;

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: "Missing GitHub OAuth environment variables",
    };
  }

  const code = event.queryStringParameters?.code;
  if (!code) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: renderCallback({
        status: "error",
        content: { message: "Missing authorization code" },
      }),
    };
  }

  const provider = event.queryStringParameters?.provider || "github";
  const protocol = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  const redirectUri = `${protocol}://${host}/callback`;

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || tokenData.error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: renderCallback({
        status: "error",
        content: {
          message: tokenData.error_description || tokenData.error || "OAuth token exchange failed",
        },
      }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: renderCallback({
      status: "success",
      content: {
        token: tokenData.access_token,
        provider: "github",
      },
    }),
  };
};
