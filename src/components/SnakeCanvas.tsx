'use client';

import React, { useEffect, useRef } from 'react';

interface SnakeSegment {
  x: number;
  y: number;
}

interface SnakeProps {
  maxSegments?: number;
  segmentSize?: number;
  spacing?: number;
  speed?: number;
}

const SnakeCanvas: React.FC<SnakeProps> = ({
  maxSegments = 20,
  segmentSize = 20,
  spacing = 5,
  speed = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<{
    segments: SnakeSegment[];
    maxSegments: number;
    segmentSize: number;
    spacing: number;
    speed: number;
  }>({
    segments: [],
    maxSegments,
    segmentSize,
    spacing,
    speed
  });
  
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });


  const initSnake = (canvasWidth: number, canvasHeight: number) => {
    const segments: SnakeSegment[] = [];
    for (let i = 0; i < snakeRef.current.maxSegments; i++) {
      segments.push({
        x: canvasWidth / 2,
        y: canvasHeight / 2
      });
    }
    snakeRef.current.segments = segments;
  };


  const drawSnakeHead = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    direction: number
  ) => {
    const { segmentSize } = snakeRef.current;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(direction);
    
    // Head
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.ellipse(0, 0, segmentSize, segmentSize * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.ellipse(segmentSize * 0.3, segmentSize * 0.3, segmentSize * 0.2, segmentSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-segmentSize * 0.3, -segmentSize * 0.2, segmentSize * 0.2, segmentSize * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.ellipse(segmentSize * 0.4, -segmentSize * 0.2, segmentSize * 0.25, segmentSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(segmentSize * 0.4, segmentSize * 0.2, segmentSize * 0.25, segmentSize * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye shine
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(segmentSize * 0.5, -segmentSize * 0.3, segmentSize * 0.08, segmentSize * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(segmentSize * 0.5, segmentSize * 0.1, segmentSize * 0.08, segmentSize * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Tongue
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.moveTo(segmentSize * 0.8, 0);
    ctx.lineTo(segmentSize * 1.4, -segmentSize * 0.2);
    ctx.lineTo(segmentSize * 1.2, 0);
    ctx.lineTo(segmentSize * 1.4, segmentSize * 0.2);
    ctx.lineTo(segmentSize * 0.8, 0);
    ctx.fill();
    
    ctx.restore();
  };


  const drawSnakeSegment = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Spots
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(x + size * 0.3, y + size * 0.3, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };


  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const { segments, segmentSize, spacing, speed } = snakeRef.current;
    
    // Update first segment (head) with easing
    const headIndex = 0;
    const targetX = mouseRef.current.x;
    const targetY = mouseRef.current.y;
    
    // Calculate angle for head rotation
    const dx = targetX - segments[headIndex].x;
    const dy = targetY - segments[headIndex].y;
    const angle = Math.atan2(dy, dx);
    
    // Move head towards mouse with limited speed
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 1) {
      segments[headIndex].x += (dx / distance) * speed;
      segments[headIndex].y += (dy / distance) * speed;
    }
    
    // Update the rest of the segments to follow
    for (let i = 1; i < segments.length; i++) {
      const prevSegment = segments[i - 1];
      const currentSegment = segments[i];
      
      // Calculate direction vector
      const segDx = prevSegment.x - currentSegment.x;
      const segDy = prevSegment.y - currentSegment.y;
      const segDistance = Math.sqrt(segDx * segDx + segDy * segDy);
      
      // Only move if beyond spacing distance
      const targetDistance = segmentSize + spacing;
      if (segDistance > targetDistance) {
        const moveFactor = (segDistance - targetDistance) / segDistance;
        currentSegment.x += segDx * moveFactor;
        currentSegment.y += segDy * moveFactor;
      }
    }
    
    // Draw snake segments in reverse order (tail to head)
    for (let i = segments.length - 1; i > 0; i--) {
      const segment = segments[i];
      const segSize = segmentSize * (0.7 + (1 - i / segments.length) * 0.3);
      drawSnakeSegment(ctx, segment.x, segment.y, segSize);
    }
    
    // Draw head last (on top)
    drawSnakeHead(ctx, segments[0].x, segments[0].y, angle);
    
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
 
        mouseRef.current = {
          x: canvas.width / 2,
          y: canvas.height / 2
        };

        if (snakeRef.current.segments.length === 0) {
          initSnake(canvas.width, canvas.height);
        }
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      mouseRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };
    handleResize();
    initSnake(canvas.width, canvas.height);
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    const animationId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center bg-black m-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
};

export default SnakeCanvas;