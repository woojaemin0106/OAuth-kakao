require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const kakaoClientId = process.env.KAKAO_REST_API_KEY;
const redirectURI = process.env.KAKAO_REDIRECT_URI;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.post("/kakao/login", async (req, res) => {
  try {
    const { authorizationCode } = req.body;
    if (!authorizationCode) {
      return res.status(400).json({ message: "authorizationCode가 없습니다." });
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", kakaoClientId);
    params.append("redirect_uri", redirectURI);
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
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return res.json(response.data.properties);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message };
    return res.status(status).json(data);
  }
});

app.listen(PORT, () => console.log(`서버 열림! http://127.0.0.1:${PORT}`));
