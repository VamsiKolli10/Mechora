const config = require("../config/secrets");

const options = {
  httpOnly: true,
  sameSite: config.cookies.sameSite,
  secure: config.cookies.secure,
  path: "/",
  ...(config.cookies.domain ? { domain: config.cookies.domain } : {}),
};

const setSessionCookies = (res, accessToken, refreshToken) => {
  res.cookie(config.cookies.access, accessToken, { ...options, maxAge: config.cookies.accessMaxAgeMs });
  res.cookie(config.cookies.refresh, refreshToken, { ...options, maxAge: config.cookies.refreshMaxAgeMs });
};

const clearSessionCookies = (res) => {
  res.clearCookie(config.cookies.access, options);
  res.clearCookie(config.cookies.refresh, options);
};

module.exports = { setSessionCookies, clearSessionCookies };
