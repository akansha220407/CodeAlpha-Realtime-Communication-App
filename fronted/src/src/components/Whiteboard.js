import React, { useRef, useEffect, useState } from 'react';
import { 
  sendDraw, 
  sendClearWhiteboard, 
  onDraw, 
  onClearWhiteboard 
} from '../utils/socket';

const Whiteboard = ({ roomId }) => {
  const canvasRef = useRef();
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Setup canvas
    canvas.width = 800;
    canvas.height = 600;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Socket listeners
    const handleRemoteDraw = (data) => {
      drawLine(
        context,
        data.x0, data.y0,
        data.x1, data.y1,
        data.color || '#000000',
        data.brushSize || 5,
        false
      );
    };

    const handleClear = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    onDraw(handleRemoteDraw);
    onClearWhiteboard(handleClear);

    return () => {
      // Cleanup listeners if needed
    };
  }, [roomId]);

  const drawLine = (context, x0, y0, x1, y1, color, size, emit = true) => {
    context.strokeStyle = color;
    context.lineWidth = size;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (emit) {
      sendDraw({ x0, y0, x1, y1, color, brushSize: size });
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvasRef.current.getContext('2d');
    drawLine(
      context,
      canvasRef.current.lastX, canvasRef.current.lastY,
      x, y,
      color, brushSize
    );

    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const context = canvasRef.current.getContext('2d');
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    sendClearWhiteboard();
  };

  return (
    <div className="card">
      <h2>Whiteboard</h2>
      
      <div className="whiteboard-tools">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '40px', height: '40px' }}
        />
        <select
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="form-control"
          style={{ width: '100px' }}
        >
          <option value={2}>Small</option>
          <option value={5}>Medium</option>
          <option value={10}>Large</option>
          <option value={20}>X-Large</option>
        </select>
        <button onClick={handleClear} className="btn btn-danger">
          Clear
        </button>
      </div>

      <div className="whiteboard-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: 'crosshair' }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
