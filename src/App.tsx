import { useEffect, useRef, useState } from 'react';
import './App.css'
import { getPeople } from './peopleService';
import { EnterIcon } from './fullScreenUi';
import PickerItem from './Item';
import GoToTopIcon from './goToTopUi';

function App() {
  const [source, setSource] = useState<"local" | "google">("local");
  const [people, setPeople] = useState<{id: string, name: string}[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("2024-02-26");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPeople(source).then(setPeople);
  }, [source]);

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
      if (
        e.key.toLowerCase() === "u" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSelectedIndex(0);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [people.length, selectedIndex]);

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

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <>
      <div className="control-panel">
        <div className="source-row">
          <button
            className={source === "local" ? "active" : ""}
            onClick={() => setSource("local")}
          >
            Local
          </button>

          <button
            className={source === "google" ? "active" : ""}
            onClick={() => setSource("google")}
          >
            Google
          </button>
        </div>

        <button
          className="fullscreen-btn"
          title='전체화면'
          onClick={toggleFullscreen}
        >
          <EnterIcon />
        </button>
      </div>
      
      <div
        ref={containerRef}
        className={`container ${isFullscreen ? "fullscreen" : ""}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {!isFullscreen && (
          <button
            className={`scroll-top-button ${selectedIndex > 0 ? "show" : ""}`}
            onClick={() => setSelectedIndex(0)}
          >
            <GoToTopIcon />
          </button>
        )}

        <div className="labelBox">
          <div
            className="label clickable"
            onClick={selectedIndex !== 0 ? moveUp : undefined}
            style={{
              color: selectedIndex === 0 ? "transparent" : "#999",
              visibility: selectedIndex === 0 ? "hidden" : "visible",
              pointerEvents: selectedIndex === 0 ? "none" : "auto"
            }}
          >
            이전
          </div>

          <div className="label">현재</div>

          <div
            className="label clickable"
            onClick={
              selectedIndex !== people.length - 1 ? moveDown : undefined
            }
            style={{
              color:
                selectedIndex === people.length - 1
                  ? "transparent"
                  : "#999",
              visibility:
                selectedIndex === people.length - 1
                  ? "hidden"
                  : "visible",
              pointerEvents:
                selectedIndex === people.length - 1
                  ? "none"
                  : "auto"
            }}
          >
            다음
          </div>
        </div>

        <div className="window">
          <div
            className="click-zone up"
            onClick={moveUp}
          />

          <div
            className="click-zone down"
            onClick={moveDown}
          />

          {people.map((person, index) => (
            <PickerItem
              key={person.id}
              title={`${person.id} ${person.name}`}
              text={`${person.id} ${person.name}`}
              isActive={index === selectedIndex}
              distance={index - selectedIndex}
              isFullscreen={isFullscreen}
            />
          ))}
          <div className="highlight" />
        </div>
      </div>
    </>
  );
}

export default App
