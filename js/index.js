let keys = {};
        const player = document.getElementById('player');
        const canvas = document.getElementById('collision-canvas');
        const solutionPath = document.getElementById('actual-solution');
        const ctx = canvas.getContext('2d');
		const PLAYER_SIZE = 12; 
		
		let collisionReady = false;
        let pX = 230; 
        let pY = 5; 
        const speed = 1.5; 
        //const pSize = 6;  Malo manjši hitbox za lažje premikanje
		const pSize = 4;
		
		
		
		const goal = document.getElementById('goal');
		const timerDisplay = document.getElementById('timer');

		let startTime = null;
		let gameWon = false;
		let gameStarted = false;

		const GOAL_X = 250;
		const GOAL_Y = 480;
		const GOAL_RADIUS = 8;
		
		
		function getDirectionName() {
			let up = keys['ArrowUp'];
			let down = keys['ArrowDown'];
			let left = keys['ArrowLeft'];
			let right = keys['ArrowRight'];

			if (up && right) return "up-right";
			if (down && right) return "down-right";
			if (down && left) return "down-left";
			if (up && left) return "up-left";
			
			if (up) return "up";
			if (down) return "down";
			if (left) return "left";
			if (right) return "right";

			return null; 
		}
		
		
		
		

        /*function setupCollision() {
			canvas.width = 484;
			canvas.height = 484;
			
			// 1. Ustvarimo kopijo (klon) SVG-ja v pomnilniku
			const svgElement = document.getElementById('maze-svg').cloneNode(true);
			
			
			svgElement.querySelector('#actual-solution')?.remove();

			
			svgElement.querySelector('#walls')?.setAttribute('stroke', '#000');
		
			const solutionInClone = svgElement.querySelector('#actual-solution');
			if (solutionInClone) {
				solutionInClone.remove();
			}

			const svgData = new XMLSerializer().serializeToString(svgElement);
			const img = new Image();
			const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
			const url = URL.createObjectURL(svgBlob);
			
			img.onload = function() {
				collisionReady = true;
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, 484, 484);
				ctx.drawImage(img, 0, 0);
				URL.revokeObjectURL(url);
				console.log("Collision map pripravljen (brez rešitve)!");
			};
			img.src = url;
		}*/

		function setupCollision() {
		    canvas.width = 484;
		    canvas.height = 484;
		
		    const originalSvg = document.getElementById('maze-svg');
		    const svgElement = originalSvg.cloneNode(true);
		
		    const solution = svgElement.querySelector('#actual-solution');
		    if (solution) solution.remove();
		
		    const walls = svgElement.querySelector('#walls');
		    if (walls) walls.setAttribute('stroke', '#000');
		
		    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		    svgElement.setAttribute('width', '484');
		    svgElement.setAttribute('height', '484');
		    svgElement.setAttribute('viewBox', '0 0 484 484');
		
		    const svgData = new XMLSerializer().serializeToString(svgElement);
		    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		    const url = URL.createObjectURL(svgBlob);
		
		    const img = new Image();
		
		    img.onload = function () {
		        ctx.fillStyle = 'white';
		        ctx.fillRect(0, 0, 484, 484);
		        ctx.drawImage(img, 0, 0);
		        collisionReady = true;
		        URL.revokeObjectURL(url);
		        console.log('Collision map ready');
		    };
		
		    img.onerror = function (err) {
		        console.error('Failed to build collision map', err);
		        collisionReady = false;
		        URL.revokeObjectURL(url);
		    };
		
		    img.src = url;
		}





        function toggleSolution() {
            solutionPath.style.display = (solutionPath.style.display === "block") ? "none" : "block";
        }

       
		
		
		function canMoveTo(nx, ny) {
			if (!collisionReady) return false;
			const hitboxSize = 8;
			const offset = 2;

			for (let x = 0; x <= hitboxSize; x += 2) {
				for (let y = 0; y <= hitboxSize; y += 2) {

					const px = Math.floor(nx + offset + x);
					const py = Math.floor(ny + offset + y);

					if (px < 0 || px >= 484 || py < 0 || py >= 484) return false;

					const pixel = ctx.getImageData(px, py, 1, 1).data;

					// Check ALL channels to avoid anti-alias leaks
					if (pixel[0] < 200 || pixel[1] < 200 || pixel[2] < 200) {
						return false;
					}
				}
			}

			return true;
		}

        function updatePosition() {
            const scale = 600 / 484;
            player.style.left = (pX * scale) + 'px';
            player.style.top = (pY * scale) + 'px';
        }
		
		

        
		window.addEventListener('keydown', (e) => {
			keys[e.key] = true;
			if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)){ 
				e.preventDefault();
				
				// TIMER ZACNE
				if (!gameStarted) {
					gameStarted = true;
					startTime = performance.now();
				}
			}
		});

		window.addEventListener('keyup', (e) => {
			keys[e.key] = false;
		});
		
		const playerImg = document.getElementById('player-img'); // Put this at the top of your script

		
		function update() {
			if (gameWon) {
			requestAnimationFrame(update);
			return;
		}
			if (gameStarted && !gameWon) {
				const elapsed = (performance.now() - startTime) / 1000;
				timerDisplay.textContent = elapsed.toFixed(2);
			}
		
		
			let dx = 0;
			let dy = 0;

			if (keys['ArrowUp']) dy -= speed;
			if (keys['ArrowDown']) dy += speed;
			if (keys['ArrowLeft']) dx -= speed;
			if (keys['ArrowRight']) dx += speed;

			if (dx !== 0 || dy !== 0) {
				const dir = getDirectionName();
				if (dir) {
					playerImg.src ="slike/" + dir + ".png";

					const diagonal = dir.includes("-"); // up-right, down-left etc.
					playerImg.style.transform = diagonal ? "scale(1.4)" : "scale(1.15)";
					playerImg.style.transformOrigin = "center";
				}
				if (canMoveTo(pX + dx, pY)) {
					pX += dx;
				} else if (canMoveTo(pX + (dx / Math.abs(dx)), pY)) {
					pX += (dx / Math.abs(dx)); 
				}

				if (canMoveTo(pX, pY + dy)) {
					pY += dy;
				} else if (canMoveTo(pX, pY + (dy / Math.abs(dy)))) {
					pY += (dy / Math.abs(dy)); 
				}

				updatePosition();

			
				const playerCenterX = pX + PLAYER_SIZE / 2;
				const playerCenterY = pY + PLAYER_SIZE / 2;

				const dxGoal = playerCenterX - GOAL_X;
				const dyGoal = playerCenterY - GOAL_Y;
				const distance = Math.sqrt(dxGoal * dxGoal + dyGoal * dyGoal);

				if (!gameWon && distance < GOAL_RADIUS + PLAYER_SIZE / 2) {
					gameWon = true;
					
					const finalTime = timerDisplay.textContent;

					Swal.fire({
						title: '🏆 Zmaga!',
						text: `Čas: ${finalTime} sekund`,
						icon: 'success',
						confirmButtonText: 'Igraj znova',
						background: '#1a1a1a',
						color: '#ffffff',
						confirmButtonColor: '#2ed573'
					}).then(() => {
						restartGame();
					});
				}
			}
			requestAnimationFrame(update);
		}
		
		
		function restartGame() {
			pX = 232;
			pY = 2;
			gameWon = false;
			gameStarted = false;
			startTime = null;
			timerDisplay.textContent = "0.00";
			playerImg.src = "slike/up.png";
			updatePosition();
		}

        window.onload = () => {
            setupCollision();
            updatePosition();
			requestAnimationFrame(update);
        };
