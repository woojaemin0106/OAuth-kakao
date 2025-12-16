const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const usersImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

function renderUserInfo(imgUrl, name) {
  if (imgUrl) usersImage.src = imgUrl;
  userName.textContent = name || "";
}

const redirectURI = "http://127.0.0.1:5500";

kakaoLoginButton.onclick = () => {
  location.href = "http://127.0.0.1:3000/oauth/kakao/authorize";
};

naverLoginButton.onclick = () => {
  location.href = "http://127.0.0.1:3000/oauth/naver/authorize";
};

window.onload = () => {
  const url = new URL(location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) return;

  const provider = state === "naver" ? "naver" : "kakao";

  const loginUrl =
    provider === "naver"
      ? "http://127.0.0.1:3000/naver/login"
      : "http://127.0.0.1:3000/kakao/login";

  const userInfoUrl =
    provider === "naver"
      ? "http://127.0.0.1:3000/naver/userinfo"
      : "http://127.0.0.1:3000/kakao/userinfo";

  axios
    .post(loginUrl, { authorizationCode: code, state })
    .then((res) => {
      const accessToken = res.data.access_token ?? res.data;
      return axios.post(userInfoUrl, { accessToken });
    })
    .then((res) => {
      const img = res.data.profile_image;
      const name = res.data.nickname ?? res.data.name ?? "사용자";
      renderUserInfo(img, name);

      history.replaceState({}, document.title, redirectURI);
    })
    .catch((err) => {
      console.error("소셜 로그인 처리 실패:", err?.response?.data || err);
    });
};
