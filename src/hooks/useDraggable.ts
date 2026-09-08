import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface DragPosition {
  x: number;
  y: number;
}

export interface UseDraggableOptions {
  initialPosition?: DragPosition;
  boundsPadding?: number;
  onDragEnd?: (pos: DragPosition) => void;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const { initialPosition = { x: 100, y: 100 }, boundsPadding = 12, onDragEnd } = options;
  const [position, setPosition] = useState<DragPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: initialPosition.x,
    posY: initialPosition.y,
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag, input, textarea, button, select, a')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      const newX = Math.max(boundsPadding, Math.min(window.innerWidth - 120, dragStartRef.current.posX + dx));
      const newY = Math.max(boundsPadding, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.(position);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, boundsPadding, onDragEnd]);

  return {
    position,
    setPosition,
    isDragging,
    handleMouseDown,
  };
}
