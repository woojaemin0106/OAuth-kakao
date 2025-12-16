const express = require("express");
const cors = require("cors");
const axios = require("axios");
const kakaoClientId = "70e7d9579bc0bdbac13f049b3df7dc8a";
const redirectURI = "http://127.0.0.1:5500";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["OPTIONS", "POST", "DELETE"],
  })
);

app.use(express.json());

app.post("/kakao/login", (req, res) => {
  const authorizationCode = req.body.authorizationCode;

  axios
    .post(
      "https://kauth.kakao.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: kakaoClientId,
        redirect_uri: redirectURI,
        code: authorizationCode,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    )
    .then((response) => res.send(response.data.access_token));
});

app.post("/kakao/userinfo", (req, res) => {
  const { accessToken } = req.body;
  axios
    .get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": " application/x-www-form-urlencoded;charset=utf-8",
      },
    })
    .then((response) => res.json(response.data.properties));
});
app.listen(3000, () => console.log("서버 열림!"));
