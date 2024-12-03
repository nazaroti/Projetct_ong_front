async function fetchEventRequests() {
    try {

        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('http://localhost:30079/api/eventos/em-analise', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro na resposta da requisição: ' + response.status);
        }

        const eventos = await response.json();

        const container = document.getElementById('event-cards-container');
        container.innerHTML = ''; // Limpa os cards anteriores

        eventos.forEach(evento => {
            const card = document.createElement('div');
            card.className = 'event-card';

            card.innerHTML = `
                <div class="event-card-content">
                    <h3 class="event-card-title">🎈 ${evento.Nome}</h3>
                    <p class="event-card-info"><strong>📅 Data:</strong> ${evento.Data}</p>
                    <p class="event-card-info"><strong>🕒 Horário:</strong> ${evento.Horario}</p>
                    <p class="event-card-info"><strong>🗺️ Local:</strong> ${evento.Local}</p>
                    <p class="event-card-info"><strong>⏳ Duração:</strong> ${evento.Duracao}</p>
                    <p class="event-card-info"><strong>👥 Vagas:</strong> ${evento.Num_Vagas}</p>
                    <p class="event-card-info"><strong>🙋 Responsável:</strong> ${evento.Nome_Responsavel}</p>
                    <p class="event-card-description"><strong>Descrição:</strong> ${evento.Descricao}</p>
                </div>
                <div class="event-card-buttons">
                    <form>
                        <button class="event-card-button reject" name="reject" value="reject"
                            onclick="showModal(event, 'reject', ${evento.ID_Evento})">Recusar</button>
                    </form>
                    <form>
                        <button class="event-card-button accept" name="approve" value="approve"
                            onclick="showModal(event, 'approve', ${evento.ID_Evento})">Aceitar</button>
                    </form>
                </div>
            `;
            container.appendChild(card);
        })
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}


function showModal(event, action, eventId) {
    event.preventDefault(); // Evita comportamento padrão do link ou botão

    const modalTitle = document.getElementById('modal-title');
    const eventInput = document.getElementById('event_id');

    // Define o título e valor do campo oculto com base na ação
    if (action === "approve") {
        modalTitle.innerText = "Deseja APROVAR o Evento?";
        document.getElementById('confirm').value = "aprovado";
    } else {
        modalTitle.innerText = "Deseja REPROVAR o Evento?";
        document.getElementById('confirm').value = "reprovado";
    } 

    // Define o ID do evento
    eventInput.value = eventId;

    // Exibe os logs no console para depuração
    console.log("Event ID: " + eventId);
    console.log("Action: " + action);

    // Mostra o modal
    document.getElementById('modal').style.display = 'flex';
}

async function confirmEvent() {
    const eventId = document.getElementById('event_id').value; 
    const confirmValue = document.getElementById('confirm').value; 

    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('http://localhost:30079/api/updateEventStatus', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                event_id: eventId, 
                confirm: confirmValue, 
            }),
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }

        closeModal('modal');
        alert('Status do evento atualizado com sucesso!');
        window.location.reload(); 
    } catch (error) {
        console.error('Erro ao atualizar status do evento:', error);
        alert('Erro ao atualizar o status. Tente novamente.');
    }
}

function closeModal(popup) {
    document.getElementById(popup).style.display = 'none';
    console.log("Modal fechado");
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


fetchEventRequests();