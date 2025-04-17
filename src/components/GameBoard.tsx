import React, { useEffect, useRef } from 'react';

interface Player {
  id: string;
  name: string;
  position: number;
  color: string;
}

interface GameBoardProps {
  players: Player[];
  boardSize: number;
  snakesAndLadders: { [key: number]: number };
  currentPlayerId: string;
}

const GameBoard: React.FC<GameBoardProps> = ({
  players, 
  boardSize = 100, 
  snakesAndLadders,
  currentPlayerId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridSize = 10;

  const getPositionCoordinates = (position: number, cellWidth: number, cellHeight: number) => {
    if (position <= 0) return { x: -50, y: -50 };
  
    const adjustedPosition = position - 1;
    const row = Math.floor(adjustedPosition / gridSize);
    let col = adjustedPosition % gridSize;
    
    if (row % 2 === 1) {
      col = gridSize - 1 - col;
    }

    const x = col * cellWidth + cellWidth / 2;
    const y = (gridSize - 1 - row) * cellHeight + cellHeight / 2;
    return { x, y };
  };

  // Function to draw a cartoon ladder between two points
  const drawLadder = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, cellWidth: number) => {
    // Calculate the angle of the ladder
    const angle = Math.atan2(endY - startY, endX - startX);
    
    // Calculate the length of the ladder
    const ladderLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    
    // Calculate the width of the ladder
    const ladderWidth = cellWidth * 0.25;
    
    // Calculate the number of rungs based on the length of the ladder
    const numRungs = Math.max(3, Math.floor(ladderLength / (cellWidth * 0.5)));
    
    // Save the current context state
    ctx.save();
    
    // Translate and rotate the context to align with the ladder
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    
    // Draw the ladder sides
    ctx.beginPath();
    ctx.lineWidth = cellWidth * 0.06;
    ctx.strokeStyle = '#edcf0c'; // Brown color for wooden ladder
    
    // Left side
    ctx.moveTo(0, -ladderWidth / 2);
    ctx.lineTo(ladderLength, -ladderWidth / 2);
    
    // Right side
    ctx.moveTo(0, ladderWidth / 2);
    ctx.lineTo(ladderLength, ladderWidth / 2);
    
    ctx.stroke();
    
    // Draw the rungs
    for (let i = 1; i <= numRungs; i++) {
      const rungPos = (i * ladderLength) / (numRungs + 1);
      
      ctx.beginPath();
      ctx.lineWidth = cellWidth * 0.04;
      ctx.strokeStyle = '#A0522D'; // Slightly different brown for the rungs
      ctx.moveTo(rungPos, -ladderWidth / 2);
      ctx.lineTo(rungPos, ladderWidth / 2);
      ctx.stroke();
    }
    
    // Restore the context state
    ctx.restore();

  };

  // Function to draw a cartoon snake between two points
  const drawSnake = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, cellWidth: number) => {
    // Calculate the midpoint for our curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    
    // Add some randomness to create a more natural snake curve
    const controlX1 = startX + (midX - startX) * 0.5 + (Math.random() * cellWidth - cellWidth / 2);
    const controlY1 = startY + (midY - startY) * 0.5 + (Math.random() * cellWidth - cellWidth / 2);
    
    const controlX2 = midX + (endX - midX) * 0.5 + (Math.random() * cellWidth - cellWidth / 2);
    const controlY2 = midY + (endY - midY) * 0.5 + (Math.random() * cellWidth - cellWidth / 2);
    
    // Calculate the total length of the path to determine snake segments
    const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 1.5; // Approximate curve length
    const snakeWidth = cellWidth * 0.2;
    
    // Save the points along the path for body segments
    const pathPoints = [];
    const numPoints = Math.max(10, Math.floor(pathLength / (cellWidth * 0.15)));
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Cubic Bezier formula
      const x = Math.pow(1 - t, 3) * startX + 
                3 * Math.pow(1 - t, 2) * t * controlX1 + 
                3 * (1 - t) * Math.pow(t, 2) * controlX2 + 
                Math.pow(t, 3) * endX;
      
      const y = Math.pow(1 - t, 3) * startY + 
                3 * Math.pow(1 - t, 2) * t * controlY1 + 
                3 * (1 - t) * Math.pow(t, 2) * controlY2 + 
                Math.pow(t, 3) * endY;
      
      pathPoints.push({ x, y });
    }
    
    // Draw the snake body
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const segment = pathPoints[i];
      const nextSegment = pathPoints[i + 1];
      
      // Calculate the angle between current and next segment
      const dx = nextSegment.x - segment.x;
      const dy = nextSegment.y - segment.y;
      const angle = Math.atan2(dy, dx);
      
      // Calculate perpendicular points to create snake width
      const perpX = Math.sin(angle) * snakeWidth * (1 - i/pathPoints.length * 0.3); // Snake tapers toward tail
      const perpY = -Math.cos(angle) * snakeWidth * (1 - i/pathPoints.length * 0.3);
      
      // Draw this segment of the snake body
      ctx.beginPath();
      ctx.fillStyle = i % 2 === 0 ? '#2F8E4C' : '#f3f01e'; // Alternating green stripes
      
      // Create a segment shape
      ctx.moveTo(segment.x + perpX, segment.y + perpY);
      ctx.lineTo(nextSegment.x + perpX, nextSegment.y + perpY);
      ctx.lineTo(nextSegment.x - perpX, nextSegment.y - perpY);
      ctx.lineTo(segment.x - perpX, segment.y - perpY);
      
      ctx.closePath();
      ctx.fill();
      
      // Add a subtle outline
      ctx.strokeStyle = '#1E5E32';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw the snake head
    const headPoint = pathPoints[0];
    const headSize = snakeWidth * 1.8;
    
    // Calculate the angle of the head based on the first segments
    const headAngle = Math.atan2(
      pathPoints[2].y - headPoint.y,
      pathPoints[2].x - headPoint.x
    );
    
    ctx.save();
    ctx.translate(headPoint.x, headPoint.y);
    ctx.rotate(headAngle);
    
    // Draw the head shape
    ctx.beginPath();
    ctx.fillStyle = '#2F8E4C';
    ctx.ellipse(0, 0, headSize, headSize * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.ellipse(-headSize * 0.3, -headSize * 0.3, headSize * 0.25, headSize * 0.25, 0, 0, Math.PI * 2);
    ctx.ellipse(-headSize * 0.3, headSize * 0.3, headSize * 0.25, headSize * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.ellipse(-headSize * 0.3, -headSize * 0.3, headSize * 0.12, headSize * 0.15, 0, 0, Math.PI * 2);
    ctx.ellipse(-headSize * 0.3, headSize * 0.3, headSize * 0.12, headSize * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw the tongue
    ctx.beginPath();
    ctx.strokeStyle = '#FF3366';
    ctx.lineWidth = headSize * 0.1;
    ctx.lineCap = 'round';
    ctx.moveTo(headSize * 0.7, 0);
    ctx.lineTo(headSize * 1.2, 0);
    ctx.stroke();
    
    // Draw the forked tongue
    ctx.beginPath();
    ctx.moveTo(headSize * 1.2, 0);
    ctx.lineTo(headSize * 1.4, -headSize * 0.2);
    ctx.moveTo(headSize * 1.2, 0);
    ctx.lineTo(headSize * 1.4, headSize * 0.2);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw a warning indication at the start for gameplay clarity
    ctx.beginPath();
    ctx.arc(startX, startY, cellWidth * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Red warning
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const parentWidth = canvas.parentElement?.clientWidth || 600;
    const size = Math.min(parentWidth, 600); 
    
    canvas.width = size;
    canvas.height = size;
    
    const cellWidth = size / gridSize;
    const cellHeight = size / gridSize;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the board grid
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        let posNum;
        const row = gridSize - 1 - i; 
        
        if (row % 2 === 0) {
          posNum = row * gridSize + j + 1;
        } else {
          posNum = (row + 1) * gridSize - j;
        }
        const gradient = ctx.createLinearGradient(j * cellWidth, i * cellHeight, (j + 1) * cellWidth, (i + 1) * cellHeight);

        if ((i + j) % 2 === 0) {
          gradient.addColorStop(0, '#B5622C');
          gradient.addColorStop(1, '#AD5A2B');
        } else {
          gradient.addColorStop(0, '#3C1B10');
          gradient.addColorStop(1, '#5B2C1A');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        
        ctx.strokeStyle = '#f2f2ed';
        ctx.lineWidth = 1;
        ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        
        ctx.fillStyle = '#f7c211';
        ctx.font = `${cellWidth / 4}px 'Trebuchet MS'`;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          posNum.toString(), 
          j * cellWidth + cellWidth / 2, 
          i * cellHeight + cellHeight / 5
        );
      }
    }
    
    // Draw snakes and ladders
    if (snakesAndLadders && Object.keys(snakesAndLadders).length > 0) {
      for (const [startStr, end] of Object.entries(snakesAndLadders)) {
        const startPos = parseInt(startStr);
        const endPos = end;
        
        const startCoord = getPositionCoordinates(startPos, cellWidth, cellHeight);
        const endCoord = getPositionCoordinates(endPos, cellWidth, cellHeight);
        
        if (endPos > startPos) {
          // This is a ladder (moves up)
          drawLadder(ctx, startCoord.x, startCoord.y, endCoord.x, endCoord.y, cellWidth);
          
          // Add a small indicator at the starting position
          ctx.fillStyle = '#10b981';
          ctx.font = `bold ${cellWidth / 5}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`→${endPos}`, startCoord.x, startCoord.y + cellHeight / 6);
        } else {
          // This is a snake (moves down)
          drawSnake(ctx, startCoord.x, startCoord.y, endCoord.x, endCoord.y, cellWidth);
          
          // Add a small indicator at the starting position
          ctx.fillStyle = '#ef4444';
          ctx.font = `bold ${cellWidth / 5}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`→${endPos}`, startCoord.x, startCoord.y + cellHeight / 6);
        }
      }
    }
    
    // Draw players on the board
    if (players && players.length > 0) {
      players.forEach((player, idx) => {
        if (player.position <= 0) return; 
        const playersAtSamePosition = players.filter(p => p.position === player.position);
        const playerPosIndex = playersAtSamePosition.findIndex(p => p.id === player.id);
        const totalPlayersAtPos = playersAtSamePosition.length;
        
        let offsetX = 0;
        if (totalPlayersAtPos > 1) {
          const spacing = cellWidth / (totalPlayersAtPos + 1);
          offsetX = spacing * (playerPosIndex + 1) - cellWidth / 2;
        }
        
        const coord = getPositionCoordinates(player.position, cellWidth, cellHeight);
        ctx.beginPath();
        ctx.arc(coord.x + offsetX, coord.y, cellWidth / 6, 0, Math.PI * 2);
        ctx.fillStyle = player.color || `hsl(${(idx * 137) % 360}, 70%, 50%)`;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (player.id === currentPlayerId) {
          ctx.beginPath();
          ctx.arc(coord.x + offsetX, coord.y, cellWidth / 4, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffd700'; 
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${cellWidth / 6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.name.charAt(0), coord.x + offsetX, coord.y);
      });
    }
    
  }, [players, boardSize, snakesAndLadders, currentPlayerId]);

  return (
    <div className="flex flex-col items-center">
      
      <div className="w-full max-w-xl pt-12">
        <canvas 
          ref={canvasRef} 
          className="w-full border-2 rounded-lg"
        ></canvas>
      </div>
     
    </div>
  );
};

export default GameBoard;