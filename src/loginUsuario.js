document.getElementById('button').addEventListener('click', processaFormLogin);

async function processaFormLogin(event) {
    event.preventDefault();

    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;

    // Verifica se os campos estão preenchidos
    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const resultadoLogin = await loginUser(email, password);

    if (resultadoLogin) {
        window.location.href = 'index.html';  // Página do inicial do usuário com perfil
    } 
}

async function loginUser(email, password) {
    try {
        const response = await fetch('https://project-ong-back.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();  // Pega a resposta em JSON

        if (response.ok) {
            console.log('Login bem-sucedido:', data);
            localStorage.setItem('token', data.token);  // Armazena o token
            console.log('Token armazenado:', localStorage.getItem('token'));  // Verifique se o token foi armazenado
            return true;
        } else {
            console.error('Erro no login:', data);  // Log para erros
            alert(data.message || 'Erro desconhecido ao fazer login!');
            return false;
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro na conexão com o servidor');
        return false;
    }
}

document.getElementById("togglePassword").addEventListener("click", function () {
    const passwordField = document.getElementById("password");
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);

    // Opcional: Mudar o ícone
    this.textContent = type === "password" ? "🔓" : "🔒";
});

//  Use o botão Enter para enviar o formulário em ambos os campos
document.getElementById("email").addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        processaFormLogin(event);
    }
});

document.getElementById("password").addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        processaFormLogin(event);
    }
});