async function fetchFutureEvents() {
    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }

        const response = await fetch('https://project-ong-back.onrender.com/api/eventos/eventos-futuros', {
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
        container.innerHTML = '';

        if (!eventos || eventos.length === 0) {
            container.innerHTML = `
                <div class="event-card-content">
                    <h3 class="event-card-title">Nenhum evento encontrado.</h3>
                </div>
            `;
        }

        eventos.forEach(evento => {
            const horarioSemSegundos = evento.horario.slice(0, 5);
            const dataInvertida = evento.data.split("-").reverse().join("/");
            const card = document.createElement('div');
            card.className = 'event-card';
            card.id = 'upcoming-events-card';

            card.innerHTML = `
                <div class="event-card-content">
                    <h3 class="event-card-title">🎈 ${evento.nome}</h3>
                    <div class="event-card-info-container">
                        <div class="event-card-info-column">
                            <p><strong>📅Data:</strong> ${dataInvertida}</p>
                            <p><strong>🕒Horário:</strong> ${horarioSemSegundos}</p>
                            <p><strong>🗺️Local:</strong> ${evento.local}</p>
                        </div>
                        <div class="event-card-info-column">
                            <p><strong>⏳Duração:</strong> ${evento.duracao}</p>
                            <p><strong>👥Vagas: </strong> ${evento.num_vagas}</p>
                            <p><strong>🙋Responsável:</strong> ${evento.nome_responsavel}</p>
                        </div>
                    </div>
                    <p class="event-card-description"><strong>Descrição:</strong> ${evento.descricao}</p>
                </div>
                <div class="event-card-buttons">
                    <button class="event-card-button reject" name="reject" value="delete"
                        onclick="showModal(event, this.value, ${evento.id_evento})">Excluir</button>
                    <button class="event-card-button accept" name="approve" value="edit"
                        onclick='showModalEdit(event, ${JSON.stringify(evento)})'>Editar</button>
                </div>
            `;
            container.appendChild(card);
        })
    } catch (error) {
        console.error('Erro ao buscar eventos:', error);
    }
}

function showModalEdit(event, data) {
    event.preventDefault();

    const parsedData = data;

    console.log("ID: " + data.id_evento);
    console.log("Nome " + data.nome);

    document.getElementById('modal-title').textContent = "Editar Evento: " + parsedData.nome;
    document.getElementById('event_ID').value = parsedData.id_evento;
    document.getElementById('event_name').value = parsedData.nome;
    document.getElementById('event_description').value = parsedData.descricao;
    document.getElementById('event_status').value = parsedData.status;
    document.getElementById('event_date').value = parsedData.data;
    document.getElementById('event_time').value = parsedData.horario;
    document.getElementById('event_slots').value = parsedData.num_vagas;
    document.getElementById('event_location').value = parsedData.local;
    document.getElementById('event_duration').value = parsedData.duracao;
    document.getElementById('event_responsible').value = parsedData.nome_responsavel;


    document.getElementById('modal-edit').style.display = 'flex';
}

document.getElementById('edit-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evitar o envio padrão do formulário

    // Coletar os valores dos inputs
    const eventId = document.getElementById('event_ID').value;
    const eventName = document.getElementById('event_name').value;
    const eventDescription = document.getElementById('event_description').value;
    const eventStatus = document.getElementById('event_status').value;
    const eventDate = document.getElementById('event_date').value;
    const eventTime = document.getElementById('event_time').value;
    const eventSlots = document.getElementById('event_slots').value;
    const eventLocation = document.getElementById('event_location').value;
    const eventDuration = document.getElementById('event_duration').value;
    const eventResponsible = document.getElementById('event_responsible').value;

    // Montar o payload
    const data = {
        event_ID: eventId,
        event_name: eventName,
        event_description: eventDescription,
        event_status: eventStatus,
        event_date: eventDate,
        event_time: eventTime,
        event_slots: eventSlots,
        event_location: eventLocation,
        event_duration: eventDuration,
        event_responsible: eventResponsible,
    };

    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }
        // Enviar os dados para a rota do backend
        const response = await fetch('https://project-ong-back.onrender.com/api/editData', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Evento atualizado com sucesso!');
            closeModal('modal-edit'); 
            location.reload(); 
        } else {
            const error = await response.json();
            alert('Erro ao atualizar evento: ' + (error.message || 'Erro desconhecido.'));
        }
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro ao atualizar evento: ' + error.message);
    }
});


function showModal(event, action, eventId) {
    event.preventDefault();

    const modalTitle = document.getElementById('modal-title');
    const eventInput = document.getElementById('Event_id');

    // Define o título e valor do campo oculto com base na ação
    if (action === "delete") {
        modalTitle.innerText = "Deseja EXCLUIR o Evento?";
        document.getElementById('confirm').value = "deletedo";
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
    const eventId = document.getElementById('Event_id').value;

    try {
        const token = localStorage.getItem('token');
        console.log("Token obtido:", token);

        if (!token) {
            alert("Usuário não autenticado. Redirecionando para a página de login...");
            window.location.href = 'loginUsuario.html';
            return;
        }
        const response = await fetch('https://project-ong-back.onrender.com/api/deleteEvent', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                event_id: eventId
            }),
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.status);
        }

        closeModal('modal');
        alert('Evento excluído com sucesso!');
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
            const modalId = this.id;
            closeModal(modalId); 
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

fetchFutureEvents();


