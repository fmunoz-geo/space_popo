const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const spaceship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0,
    img: new Image(),
    fuel: 100 // Initialize fuel level
};
spaceship.img.src = 'img/spaceship.png';

const explosionImg = new Image();
explosionImg.src = 'img/explosion.png'; // Replace with the actual path to the explosion image

const asteroids = [];
const powerUps = [];
let score = 0;
let isGameOver = false; // Flag to track if the game is over
let gameInterval, asteroidInterval, powerUpInterval;

function startGame() {
    gameInterval = setInterval(updateGame, 20);
    asteroidInterval = setInterval(spawnAsteroid, 1000);
    powerUpInterval = setInterval(spawnPowerUp, 5000);
}

function updateAsteroidInterval() {
    clearInterval(asteroidInterval);
    const newInterval = Math.max(1000 - score * 10, 250); // Decrease interval with score, minimum 250ms
    asteroidInterval = setInterval(spawnAsteroid, newInterval);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpaceship();
    moveSpaceship();
    handleAsteroids();
    handlePowerUps();
    updateScore();
    drawFuelBar(); // Draw the fuel bar
}

function drawSpaceship() {
    ctx.drawImage(spaceship.img, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

function getFuelColor(fuel) {
    let red, green;

    if (fuel > 50) {
        // Interpolate between green and yellow
        red = Math.floor(255 * (1 - (fuel - 50) / 50));
        green = 255;
    } else {
        // Interpolate between yellow and red
        red = 255;
        green = Math.floor(255 * (fuel / 50));
    }

    return `rgb(${red},${green},0)`;
}

function drawFuelBar() {
    const fuelColor = getFuelColor(spaceship.fuel);
    ctx.fillStyle = '#000';
    ctx.fillRect(10, 50, 200, 20); // Background for the fuel bar
    ctx.fillStyle = fuelColor;
    ctx.fillRect(10, 50, spaceship.fuel * 2, 20); // Fuel level
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 50, 200, 20); // Border of the fuel bar
}

function moveSpaceship() {
    if (spaceship.dx !== 0 || spaceship.dy !== 0) {
        spaceship.fuel -= 0.1; // Decrease fuel when moving
        if (spaceship.fuel < 0) {
            spaceship.fuel = 0;
            gameOver(); // End the game if fuel runs out
        }
    }

    spaceship.x += spaceship.dx;
    spaceship.y += spaceship.dy;

    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;
    if (spaceship.y < 0) spaceship.y = 0;
    if (spaceship.y + spaceship.height > canvas.height) spaceship.y = canvas.height - spaceship.height;
}

function handleAsteroids() {
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroid.speed;
        if (asteroid.y > canvas.height) {
            asteroids.splice(index, 1);
            score++;
			updateAsteroidInterval()
        } else {
            ctx.drawImage(asteroid.img, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
            if (!isGameOver && checkCollision(spaceship, asteroid)) {
                drawExplosion(spaceship.x + spaceship.width / 2 - 32, spaceship.y + spaceship.height / 2 - 32);
                setTimeout(gameOver, 200); // Show explosion for 200ms before game over
            }
        }
    });
}

function handlePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += powerUp.speed;
        if (powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        } else {
            ctx.drawImage(powerUp.img, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            if (checkCollision(spaceship, powerUp)) {
                activatePowerUp();
                powerUps.splice(index, 1);
            }
        }
    });
}

function spawnAsteroid() {
    const asteroid = {
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 3 + Math.random() * 2,
        img: new Image()
    };
    asteroid.img.src = 'img/asteroid.png';
    asteroids.push(asteroid);
}

function spawnPowerUp() {
    const powerUp = {
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        img: new Image()
    };
    powerUp.img.src = 'img/powerup.png';
    powerUps.push(powerUp);
}

function activatePowerUp() {
    spaceship.fuel += 20; // Increase fuel by 20
    if (spaceship.fuel > 100) {
        spaceship.fuel = 100; // Cap the fuel at 100
    }
}

function drawExplosion(x, y) {
    ctx.drawImage(explosionImg, x, y, 64, 64);
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function updateScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(asteroidInterval);
    clearInterval(powerUpInterval);
    alert('Game Over! Your score: ' + score);
    location.reload();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') spaceship.dx = spaceship.speed;
    if (e.key === 'ArrowLeft') spaceship.dx = -spaceship.speed;
    if (e.key === 'ArrowUp') spaceship.dy = -spaceship.speed;
    if (e.key === 'ArrowDown') spaceship.dy = spaceship.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') spaceship.dx = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') spaceship.dy = 0;
});

startGame();
