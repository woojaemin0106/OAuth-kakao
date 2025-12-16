const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const usersImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

function renderUserInfo(imgUrl, name) {
  usersImage.src = imgUrl;
  userName.textContent = name;
}

const kakaoClientId = "70e7d9579bc0bdbac13f049b3df7dc8a";
const redirectURI = "http://127.0.0.1:5500";

kakaoLoginButton.onclick = () => {
  location.href =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${kakaoClientId}` +
    `&redirect_uri=${encodeURIComponent(redirectURI)}` +
    `&response_type=code`;
};

window.onload = () => {
  const url = new URL(location.href);
  const authorizationCode = url.searchParams.get("code");
  if (!authorizationCode) return;

  axios
    .post("http://127.0.0.1:3000/kakao/login", { authorizationCode })
    .then((res) => {
      const accessToken = res.data.access_token ?? res.data;

      return axios.post("http://127.0.0.1:3000/kakao/userinfo", {
        accessToken,
      });
    })
    .then((res) => {
      renderUserInfo(res.data.profile_image, res.data.nickname);
      history.replaceState({}, document.title, redirectURI);
    })
    .catch((err) => {
      console.error("카카오 로그인 처리 실패:", err?.response?.data || err);
    });
};
