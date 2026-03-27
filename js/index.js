let keys = {};
        const player = document.getElementById('player');
        const solutionPath = document.getElementById('actual-solution');
		const PLAYER_SIZE = 12; 
		
        let pX = 234; 
        let pY = 3; 
        const speed = 1.5; 
        //const pSize = 6;  Malo manjši hitbox za lažje premikanje
		
		
		
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
		
		
		
		

       

        function toggleSolution() {
            solutionPath.style.display = (solutionPath.style.display === "block") ? "none" : "block";
        }

       
		
		


		function lineIntersectsRect(x1, y1, x2, y2, rx, ry, rw, rh) {
		    // Check if a wall line segment intersects the player hitbox rectangle
		    // First check if either endpoint is inside the rect
		    function pointInRect(px, py) {
		        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
		    }
		    if (pointInRect(x1, y1) || pointInRect(x2, y2)) return true;
		
		    // Check if rect corners straddle the line
		    function side(px, py) {
		        return (y2 - y1) * (px - x1) - (x2 - x1) * (py - y1);
		    }
		    const corners = [
		        [rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]
		    ];
		    const sides = corners.map(([cx, cy]) => Math.sign(side(cx, cy)));
		    if (sides.some(s => s !== sides[0])) {
		        // Line infinite crosses rect — now check segment bounds
		        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
		        const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
		        if (maxX >= rx && minX <= rx + rw && maxY >= ry && minY <= ry + rh) return true;
		    }
		    return false;
		}
		
		// Cache the wall lines once
		let wallLines = null;
		function getWallLines() {
		    if (wallLines) return wallLines;
		    wallLines = [];
		    const lines = document.querySelectorAll('#walls line');
		    lines.forEach(line => {
		        wallLines.push({
		            x1: parseFloat(line.getAttribute('x1')),
		            y1: parseFloat(line.getAttribute('y1')),
		            x2: parseFloat(line.getAttribute('x2')),
		            y2: parseFloat(line.getAttribute('y2'))
		        });
		    });
		    return wallLines;
		}
		
		function canMoveTo(nx, ny) {
		    const scale = 484 / 600; // SVG coords are 484, display is 600px
		    // Convert player screen position to SVG coordinate space
		    const sx = nx * scale;
		    const sy = ny * scale;
		    const sw = PLAYER_SIZE * scale;
		    const sh = PLAYER_SIZE * scale;
		
		    // Boundary check
		    if (sx < 0 || sy < 0 || sx + sw > 484 || sy + sh > 484) return false;
		
		    for (const {x1, y1, x2, y2} of getWallLines()) {
		        if (lineIntersectsRect(x1, y1, x2, y2, sx, sy, sw, sh)) {
		            return false;
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

			
				const scale = 484 / 600;
				const playerCenterX = (pX + PLAYER_SIZE / 2) * scale;
				const playerCenterY = (pY + PLAYER_SIZE / 2) * scale;

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
			pX = 234;
			pY = 3;
			gameWon = false;
			gameStarted = false;
			startTime = null;
			timerDisplay.textContent = "0.00";
			playerImg.src = "slike/up.png";
			updatePosition();
		}

        window.onload = () => {
            updatePosition();
			requestAnimationFrame(update);
        };
