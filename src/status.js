// Função para obter o nome do usuário logado usando o token
async function obterNome() {
    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('https://project-ong-back.onrender.com/perfil', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Dados do usuário obtidos:", data);
            console.log("Formato dos dados do usuário:", JSON.stringify(data, null, 2)); // Exibe o formato completo

            if (data && data.user) {
                // Exibe o nome do usuário no local apropriado
                document.getElementById('nome_usuario').innerText = data.user.nome || 'Usuário';
            } else {
                console.error("Estrutura de dados inesperada:", data);
                alert("Erro ao obter o nome do usuário. Dados inválidos recebidos.");
            }
        } else if (response.status === 401) {
            alert("Sessão expirada ou token inválido. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
        } else {
            alert("Erro ao obter o nome do usuário. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro ao obter nome do usuário:", error);
        alert("Erro na conexão com o servidor. Tente novamente mais tarde.");
    }
}
function getUserIdFromToken() {
    const token = localStorage.getItem("token"); // Token armazenado no localStorage
    if (!token) return null;

    try {
        const decodedToken = jwt_decode(token); // Decodifica o token usando a biblioteca jwt-decode
        const idUsuario = decodedToken.id; // Obtém o ID do usuário do payload do token
        console.log("ID do usuário obtido do token:", idUsuario);
        return idUsuario;
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}

// Função para carregar os eventos do usuário logado
async function loadUserEvents() {
    const userId = getUserIdFromToken();
    console.log("ID do usuário obtido do token:", userId);
    if (!userId) {
        console.error("Usuário não autenticado.");
        return;
    }

    // Função para formatar a data
    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', options); // Formato dia/mês/ano
    }

    try {
        const response = await fetch(`https://project-ong-back.onrender.com/api/eventos2?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                'Content-Type': 'application/json',
            },
        });

        // Verifica se a resposta da API foi bem-sucedida
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const events = await response.json();
        console.log("Eventos retornados:", events);

        const container = document.querySelector(".card-container");
        container.innerHTML = ''; // Limpa o conteúdo anterior

        // Renderiza cada evento
        events.forEach(event => {
            const isEditable = event.status === "em analise";

            // Define o texto de status em português
            const statusText = {
                'em analise': 'EM ANÁLISE',
                'aprovado': 'APROVADO',
                'reprovado': 'REPROVADO',
            }[event.status] || 'INDEFINIDO';

            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <div class="card-header">
                    <div class="status-icon">
                        <i class="fa ${{
                            'em analise': 'fa-spinner',
                            'aprovado': 'fa-check-circle',
                            'reprovado': 'fa-times-circle',
                        }[event.status] || ''}"></i>
                    </div>
                    <div class="status-info">
                        <p class="status-text">${statusText}</p>
                        <p class="card-number">Nº #${event.id_evento}</p>
                    </div>
                </div>
                <hr>
                <div class="card-body">
                    <p><b>${event.nome}</b></p>
                    <p>📅 Data: ${formatDate(event.data)}</p>
                    <p>⏰ Horário: ${event.horario}</p>
                    <p>📍 Local: ${event.local}</p>
                    <p>⏳ Duração: ${event.duracao}</p>
                    <p>👥 Vagas: ${event.num_vagas}</p>
                    <p>👤 Responsável: ${event.nome_responsavel}</p>
                    <p>📝 Descrição: ${event.descricao || "(Nenhuma descrição fornecida)"}</p>
                </div>
                <div class="card-footer">
                    ${isEditable ? `<button class="delete-btn" onclick="deleteEvent(${event.id_evento})">EXCLUIR</button>` : ''}
                </div>
            `;

            container.prepend(card); // Insere o card no início
        });
    } catch (error) {
        console.error("Erro ao carregar eventos:", error);
    }
}


// Função para excluir um evento
async function deleteEvent(eventId) {
    try {
        const response = await fetch(`https://project-ong-back.onrender.com/api/eventos?eventId=${eventId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) { // Verifica se o status da resposta está entre 200-299
            alert("Evento excluído com sucesso.");
            loadUserEvents(); // Recarrega os eventos após a exclusão
        } else {
            const result = await response.json();
            alert(`Erro ao excluir evento: ${result.message}`);
        }
    } catch (error) {
        console.error("Erro ao excluir evento:", error);
        alert("Erro ao tentar excluir o evento.");
    }
}

// Carrega os eventos ao carregar a página
document.addEventListener("DOMContentLoaded", loadUserEvents);


// Chama a função ao carregar a página
window.onload = function () {
    console.log("Carregando a página, obtendo nome do usuário...");
    obterNome(); // Certifique-se de que o nome do usuário é carregado ao abrir a página
};











