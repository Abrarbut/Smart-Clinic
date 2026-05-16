import type { CookieOptions, Request, Response } from "express";

const SESSION_COOKIE_NAME = "sid";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const sessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  signed: true,
  path: "/",
});

export function getSessionUserId(req: Request): number | null {
  const value = req.signedCookies?.[SESSION_COOKIE_NAME];
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export function setSessionUserId(res: Response, userId: number) {
  res.cookie(SESSION_COOKIE_NAME, String(userId), {
    ...sessionCookieOptions(),
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
}
