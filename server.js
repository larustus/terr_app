const WebSocket = require('ws');
const fetch = require('node-fetch');

let user_id = 1;

const wss = new WebSocket.Server({ port: 8082 });

// Fetch user data to get terrarium IDs
const fetchUserData = async () => {
    try {
        console.log('Fetching user data...');
        const response = await fetch(`http://localhost:8081/users/${user_id}`);
        if (!response.ok) throw new Error(`Failed to fetch user data: ${response.statusText}`);
        const user = await response.json();
        console.log('Fetched user data:', user);
        return user.terrariumData; // Array of terrariums
    } catch (error) {
        console.error('Error fetching user data:', error);
        return [];
    }
};

// Fetch reading data for a specific terrarium ID
const fetchReadingData = async (terrariumId) => {
    try {
        console.log(`Fetching reading for terrarium ID ${terrariumId}...`);
        const response = await fetch(`http://localhost:8081/readings/t/${terrariumId}`);
        if (!response.ok) throw new Error(`Failed to fetch reading for terrarium ${terrariumId}: ${response.statusText}`);
        const reading = await response.json();
        console.log(`Fetched reading for terrarium ID ${terrariumId}:`, reading);
        return reading;
    } catch (error) {
        console.error(`Error fetching reading for terrarium ID ${terrariumId}:`, error);
        return null;
    }
};

// Broadcast data to all connected clients
const broadcast = (data) => {
    console.log('Broadcasting data to clients:', JSON.stringify(data));
    let clientCount = 0;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
            clientCount++;
        }
    });

    console.log(`Broadcasted data to ${clientCount} client(s)`);
};

// WebSocket connection setup
wss.on('connection', async (ws) => {
    console.log('New client connected');

    // Fetch user data and initial readings
    const terrariums = await fetchUserData();
    for (const terrarium of terrariums) {
        const initialReading = await fetchReadingData(terrarium.id);
        if (initialReading) {
            console.log(`Sending initial reading for terrarium ${terrarium.id} to client`);
            ws.send(JSON.stringify(initialReading));
        }
    }

    // Poll API every 30 seconds and broadcast updates
    const intervalId = setInterval(async () => {
        for (const terrarium of terrariums) {
            const updatedReading = await fetchReadingData(terrarium.id);
            if (updatedReading) {
                broadcast(updatedReading);
            }
        }
    }, 10000); // Polling interval (30 seconds)

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId); // Clean up interval on client disconnect
    });
});

console.log('WebSocket server running on ws://localhost:8082');
