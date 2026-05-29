exports.handler = async (event) => {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      body: "Missing GITHUB_OAUTH_CLIENT_ID",
    };
  }

  const provider = event.queryStringParameters?.provider || "github";
  if (provider !== "github") {
    return {
      statusCode: 400,
      body: "Invalid provider",
    };
  }

  const protocol = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host;
  const redirectUri = `${protocol}://${host}/callback`;
  const scope = process.env.GITHUB_REPO_PRIVATE === "true" ? "repo,user" : "public_repo,user";
  const state = Math.random().toString(16).slice(2);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  return {
    statusCode: 302,
    headers: {
      Location: url.toString(),
    },
    body: "",
  };
};
