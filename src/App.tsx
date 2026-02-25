import { useEffect, useRef, useState } from 'react';
import './App.css'
import { getPeople } from './peopleService';

function App() {
  const [people, setPeople] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getPeople().then(setPeople);
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const startY = useRef<number | null>(null);

  // prevent index overflow
  const clampIndex = (index: number) => {
    if (index < 0) return 0;
    if (index >= people.length) return people.length - 1;
    return index;
  };

  const moveUp = () => {
    setSelectedIndex((prev) => clampIndex(prev - 1));
  };

  const moveDown = () => {
    setSelectedIndex((prev) => clampIndex(prev + 1));
  };

  // keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveUp();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveDown();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        moveDown();
      }
      if (e.key === " ") {
        e.preventDefault();
        moveDown();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [people.length]);

  // mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) moveDown();
    else moveUp();
  };

  // dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (startY.current === null) return;
    const diff = e.clientY - startY.current;

    if (diff > 20) moveUp();
    if (diff < -20) moveDown();

    startY.current = null;
  };

  return (
    <div
      className="container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="labelBox">
        <div className="label">현재</div>
        <div 
          className="label clickable"
          onClick={moveDown}
          style={{
            color: "#999"
        }}>
          다음
        </div>
      </div>


      <div className="window">
        {people.map((person, index) => {
          const distance = index - selectedIndex;
          const absDistance = Math.abs(distance);

          const scale = 1 - absDistance * 0.15;
          const opacity = 1 - absDistance * 0.3;
          const isActive = index === selectedIndex;

          return (
            <div
              key={index}
              className="item"
              style={{
                transform: `translateY(${distance * 40}px) scale(${scale})`,
                opacity: opacity < 0 ? 0 : opacity,
                zIndex: 100 - absDistance,
                color: isActive ? "#000" : "#555",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {person.id} {person.name}
            </div>
          );
        })}

        <div className="highlight" />
      </div>
    </div>
  );
}

export default App
