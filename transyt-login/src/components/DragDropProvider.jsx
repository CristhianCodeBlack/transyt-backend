import React, { useState, createContext, useContext } from 'react';

const DragDropContext = createContext();

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};

export const DragDropProvider = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZone, setDropZone] = useState(null);

  const handleDragStart = (item, type) => {
    setDraggedItem({ ...item, type });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropZone(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, onDrop) => {
    e.preventDefault();
    if (draggedItem && onDrop) {
      onDrop(draggedItem);
    }
    handleDragEnd();
  };

  const value = {
    draggedItem,
    dropZone,
    setDropZone,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
};

export const DraggableItem = ({ item, type, children, onDragStart }) => {
  const { handleDragStart, handleDragEnd } = useDragDrop();

  return (
    <div
      draggable
      onDragStart={() => {
        handleDragStart(item, type);
        onDragStart?.(item);
      }}
      onDragEnd={handleDragEnd}
      className="cursor-move"
    >
      {children}
    </div>
  );
};

export const DropZone = ({ onDrop, acceptTypes = [], children, className = "" }) => {
  const { handleDragOver, handleDrop, draggedItem, setDropZone } = useDragDrop();
  const [isOver, setIsOver] = useState(false);

  const canAccept = !acceptTypes.length || acceptTypes.includes(draggedItem?.type);

  return (
    <div
      onDragOver={(e) => {
        handleDragOver(e);
        if (canAccept) {
          setIsOver(true);
          setDropZone(true);
        }
      }}
      onDragLeave={() => {
        setIsOver(false);
        setDropZone(false);
      }}
      onDrop={(e) => {
        if (canAccept) {
          handleDrop(e, onDrop);
        }
        setIsOver(false);
      }}
      className={`${className} ${isOver && canAccept ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
    >
      {children}
    </div>
  );
};

export default DragDropProvider;