require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI;

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("OK"));

app.get("/oauth/kakao/authorize", (req, res) => {
  const url =
    "https://kauth.kakao.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(KAKAO_REST_API_KEY)}` +
    `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
    `&response_type=code` +
    `&state=kakao`;
  return res.redirect(url);
});

app.get("/oauth/naver/authorize", (req, res) => {
  const url =
    "https://nid.naver.com/oauth2.0/authorize" +
    `?client_id=${encodeURIComponent(NAVER_CLIENT_ID)}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}` +
    `&state=naver`;
  return res.redirect(url);
});

app.post("/kakao/login", async (req, res) => {
  try {
    const { authorizationCode } = req.body;
    if (!authorizationCode) {
      return res.status(400).json({ message: "authorizationCode가 없습니다." });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", KAKAO_REST_API_KEY);
    params.append("redirect_uri", KAKAO_REDIRECT_URI);
    params.append("code", authorizationCode);

    const response = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    return res.json({ access_token: response.data.access_token });
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json(data);
  }
});

app.post("/kakao/userinfo", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "accessToken이 없습니다." });
    }

    const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.json(response.data.properties);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json(data);
  }
});

app.post("/naver/login", async (req, res) => {
  try {
    const { authorizationCode, state } = req.body;
    if (!authorizationCode) {
      return res.status(400).json({ message: "authorizationCode가 없습니다." });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", NAVER_CLIENT_ID);
    params.append("client_secret", NAVER_CLIENT_SECRET);
    params.append("code", authorizationCode);
    params.append("state", state || "naver");

    const response = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );

    return res.json({ access_token: response.data.access_token });
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json(data);
  }
});

app.post("/naver/userinfo", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: "accessToken이 없습니다." });
    }

    const response = await axios.get("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.json(response.data.response);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json(data);
  }
});

app.listen(PORT, () => console.log(`서버 열림! http://127.0.0.1:${PORT}`));
