// Função para buscar e exibir os eventos da rota /teste2
async function carregarEventos() {
    try {
        // Faz a requisição para o backend
        const response = await fetch('https://project-ong-back.onrender.com/api/eventos'); // Ajuste a URL conforme necessário

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao buscar eventos.');
        }

        // Converte a resposta em JSON
        const eventos = await response.json();

        // Imprime os eventos no console
        console.log('Nomes dos Eventos Ativos:');
        eventos.forEach(evento => {
            console.log(evento.nome);  // Assumindo que "nome" é o campo que contém o nome do evento
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error.message);
    }
}

// Chama a função para carregar os eventos
carregarEventos();
