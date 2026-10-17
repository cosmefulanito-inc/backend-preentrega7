const socket = io();

socket.on('service:created', (service) => {
  const tbody = document.getElementById('services-list');
  if (!tbody) return; // no estamos en la página de servicios

  document.getElementById('empty-row')?.remove();

  const row = document.createElement('tr');
  const cells = [
    service.name,
    service.description,
    `${service.duration} min`,
    `$${service.price}`,
    service.category,
    service.available ? 'Disponible' : 'No disponible',
  ];

  cells.forEach((text) => {
    const td = document.createElement('td');
    td.textContent = text;
    row.appendChild(td);
  });

  tbody.appendChild(row);
});