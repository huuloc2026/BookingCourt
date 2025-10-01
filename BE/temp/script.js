document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const resultDiv = document.getElementById('result');

  // Lấy URL của backend NestJS của bạn
  const backendUrl = 'http://localhost:8888';

  // Sự kiện khi click nút "Login with Google"
  loginBtn.addEventListener('click', () => {
    // Chuyển hướng người dùng đến endpoint đăng nhập Google của backend
    window.location.href = `${backendUrl}/api/auth/google`;
  });

  // Kiểm tra URL khi trang được tải lại sau khi đăng nhập thành công
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const refreshToken = urlParams.get('refresh');

  if (token && refreshToken) {
    // Hiển thị token nhận được từ backend
    resultDiv.innerHTML = `
      <p style="color: green;">Login successful! Here are your tokens:</p>
      <h3>Access Token</h3>
      <pre>${token}</pre>
      <h3>Refresh Token</h3>
      <pre>${refreshToken}</pre>
      <button onclick="clearTokens()">Clear Tokens</button>
    `;
    
    // Bạn có thể lưu token vào localStorage hoặc cookies ở đây
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    // Hiển thị trạng thái mặc định nếu không có token
    resultDiv.innerHTML = `<p>Please click the button to log in.</p>`;
  }
});

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = window.location.origin;
}