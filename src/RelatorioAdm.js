async function fetchEvents() {
    try {

        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginAdm.html';
            return;
        }
        const response = await fetch('https://project-ong-back.onrender.com/api/eventos/relatorio-eventos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da requisição: ' + response.status);
        }

        const eventos = await response.json();
        showEvents(eventos);

    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}

document.getElementById('filter-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário.

    const form = event.target;
    const formData = new FormData(form);

    // Extrai os valores do formulário
    const opcao = formData.get('opcao');
    const dataOpcao = formData.get('dataOpcao');

    // Envia os dados para a rota usando fetch
    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('https://project-ong-back.onrender.com/api/procurar-evento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                opcao,
                dataOpcao
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao filtrar eventos');
        }

        // Processa a resposta do servidor
        const result = await response.json();
        showEvents(result);
        console.log('Resposta do servidor:', result);

        // Atualize a interface, se necessário
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
    }
});

async function showEvents(eventos) {
    try {

        const container = document.getElementById('event-cards-container');
        container.innerHTML = '';

        if (!eventos || eventos.length === 0) {
            container.innerHTML = `
                <div class="event-card-content">
                    <h3 class="event-card-title">Nenhum evento encontrado.</h3>
                </div>
            `;
            return; // Sai da função, já que não há eventos para exibir
        }

        eventos.forEach(evento => {
            const horarioSemSegundos = evento.horario.slice(0, 5);
            const dataInvertida = evento.data.split("-").reverse().join("/");
            const card = document.createElement('div');
            card.className = 'event-card';
            card.id = 'event-report-card';

            let buttonsHtml = '';

            if (evento.status === 'em analise') {
                buttonsHtml = `
                    <input type="hidden" name="id_event" value="{{id_evento}}" />
                    <button class="event-card-button info" name="info" value="info"
                        onclick='showModal(event, ${JSON.stringify(evento)})'>Detalhes</button>
                `;
            } else if (evento.status === 'aprovado') {
                buttonsHtml = `
                    <input type="hidden" name="id_event" value="{{id_evento}}" />
                    <button class="event-card-button info" name="info" value="info"
                        onclick='showModal(event, ${JSON.stringify(evento)})'>Detalhes</button>
                    <button class="event-card-button participant" name="participant" value="view"
                        onclick="fetchParticipants(${evento.id_evento})">Participantes</button>
                `;
            } else if (evento.status === 'reprovado') {
                buttonsHtml = `
                    <button class="event-card-button info" name="info" value="info"
                        onclick='showModal(event, ${JSON.stringify(evento)})'>Detalhes</button>
                    <a class=" event-card-button reject" name="reject" value="reject">Reprovado</a>
                `;
            }

            card.innerHTML = `
                <div class="event-card-content">
                        <h3 class="event-card-title">🎈 ${evento.nome}</h3>
                        <div class="event-card-info-container">
                            <div class="event-card-info-column">
                                <p><strong>📅${dataInvertida} 🕒${horarioSemSegundos} 🗺️${evento.local}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="event-card-buttons">
                    ${buttonsHtml}
                </div>
            `;


            container.appendChild(card);
        })
    } catch (error) {
        console.error('Erro ao mostrar eventos:', error);
    }
}

async function fetchParticipants(eventId) {
    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('https://project-ong-back.onrender.com/api/getParticipants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_event: eventId }),
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar participantes');
        }
        const data = await response.json();
        console.log("Dados recebidos da API:", data);



        if (data.participants && data.participants.length > 0) {
            displayParticipantsModal(data.participants);
        } else {
            alert("Nenhum participante encontrado para o evento.");
        }
    } catch (error) {
        console.error("Erro ao buscar participantes:", error);
        alert("Ocorreu um erro ao buscar os participantes.");
    }
}

function displayParticipantsModal(participants) {
    const modal = document.getElementById('modal-participant');
    const participantList = document.getElementById('participantList');

    // Limpa a lista de participantes
    participantList.innerHTML = '';

    // Adiciona os participantes ao modal
    participants.forEach(participant => {
        const li = document.createElement('li');
        li.textContent = participant;
        participantList.appendChild(li);
    });

    // Exibe o modal
    modal.style.display = 'flex';
}

function showModal(event, data) {
    event.preventDefault();

    const parsedData = data;

    console.log("ID: " + parsedData.id_evento);
    console.log("Nome: " + parsedData.nome);

    const horarioSemSegundos = parsedData.horario.slice(0, 5);
    const dataInvertida = parsedData.data.split("-").reverse().join("/");

    document.getElementById('modal-title').textContent = parsedData.nome;
    document.getElementById('event_id').value = parsedData.id_evento;
    document.getElementById('event_description').textContent = parsedData.descricao;
    document.getElementById('event_date').textContent = dataInvertida;
    document.getElementById('event_time').textContent = horarioSemSegundos;
    document.getElementById('event_slots').textContent = parsedData.num_vagas;
    document.getElementById('event_location').textContent = parsedData.local;
    document.getElementById('event_duration').textContent = parsedData.duracao;
    document.getElementById('event_responsible').textContent = parsedData.nome_responsavel;
    document.getElementById('event_status').textContent = parsedData.status || "Status não disponível"; // Se o status não estiver disponível, usa uma mensagem padrão

    document.getElementById('modal').style.display = 'flex';
}


function closeModal(modal) {
    document.getElementById(modal).style.display = 'none';
}

document.querySelectorAll(".modal-overlay").forEach(function (modal) {
    modal.addEventListener("click", function (event) {

        if (event.target === this) {
            closeModal('modal');
        }
    });
});

function logout(event) {
    // Previne o comportamento padrão do link
    event.preventDefault();

    // Remover o token do localStorage
    localStorage.removeItem('token'); // ou sessionStorage.removeItem('token') se for o caso

    // Redirecionar para a página de login
    window.location.href = 'index.html'; // Ou qualquer página de login
}


fetchEvents();




