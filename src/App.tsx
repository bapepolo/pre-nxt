import { useEffect, useRef, useState } from 'react';
import './App.css'
import { getPeopleFromGoogle, getPeopleFromLocal, type DataSource } from './services/peopleService';
import { EnterIcon } from './icons/fullScreenIcon';
import PickerItem from './Item';
import GoToTopIcon from './icons/goToTopIcon';
import { useGoogleCsv } from './hooks/useGoogleCsv';
import { loadPersistedState, useAppPersist } from './hooks/useAppPersist';
import { MoonIcon, SunIcon, SystemIcon } from './icons/darkModeIcon';

function App() {
  // const [source, setSource] = useState<"local" | "google">("google");
  const [people, setPeople] = useState<{id: string, name: string}[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("2024-02-26");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const persisted = loadPersistedState();

  const [dataSource, setDataSource] = useState<DataSource>(
    persisted?.dataSource ?? "local"
  );

  const [darkMode, setDarkMode] = useState(
    persisted?.darkMode ?? false
  );
  const [useSystemTheme, setUseSystemTheme] = useState(
    persisted?.useSystemTheme ?? true
  );

  const [selectedIndex, setSelectedIndex] = useState(
    persisted?.selectedIndex ?? 0
  );

  const {
    url: googleUrl,
    setUrl: setGoogleUrl,
    error,
    isLoading,
    load
  } = useGoogleCsv(persisted?.googleUrl ?? "");

  useAppPersist({
    dataSource,
    googleUrl,
    darkMode,
    useSystemTheme,
    selectedIndex
  });

  // Data fetch
  useEffect(() => {
    if (dataSource === "local") {
      getPeopleFromLocal().then(setPeople);
    } else if (dataSource === "google" && googleUrl) {
      getPeopleFromGoogle(googleUrl).then(setPeople);
    }
  }, [dataSource, googleUrl]);

  const handleLoad = async () => {
    const data = await load();
    if (data) {
      setPeople(data);
      setSelectedIndex(0);
    }
  };

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
      if (
        e.key.toLowerCase() === "f" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        toggleFullscreen();
      }
      if (
        e.key.toLowerCase() === "d" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        toggleDarkMode();
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


  // Full Screen
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


  // Dark Mode
  const toggleDarkMode = () => {
    setUseSystemTheme(false);
    setDarkMode(prev => !prev);
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldDark = useSystemTheme
        ? media.matches
        : darkMode;

      document.body.classList.toggle("dark", shouldDark);
      setDarkMode(shouldDark);
    };

    applyTheme();

    if (useSystemTheme) {
      media.addEventListener("change", applyTheme);
    }

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [darkMode, useSystemTheme]);

  return (
    <>
      <div className="panel left">
        <div className="source-row">
          <button
            className={dataSource === "local" ? "active" : ""}
            onClick={() => {setDataSource("local"); setSelectedIndex(0);}}
          >
            Local
          </button>

          <button
            className={dataSource === "google" ? "active" : ""}
            onClick={() => {setDataSource("google"); setSelectedIndex(0);}}
          >
            Google
          </button>
        </div>

        {dataSource === "google" && (
          <div className="sheet-input-wrapper">
            <input
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLoad();
              }}
            />

            <button onClick={handleLoad} disabled={isLoading}>
              {isLoading ? "로딩..." : "불러오기"}
            </button>

            {error && <span className="error-text">{error}</span>}
          </div>
        )}
      </div>

      <div className='panel right'>
        <button
          onClick={toggleDarkMode}
          title={`다크모드: ${darkMode ? "dark" : "light"}`}
        >
          {darkMode ? <MoonIcon /> : <SunIcon />}
        </button>

        <button
          className={useSystemTheme ? "active" : ""}
          title="다크모드: system"
          onClick={() => setUseSystemTheme(prev => !prev)}
        >
          <SystemIcon />
        </button>

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
            className={`label clickable ${
              selectedIndex === 0 ? "disabled" : ""
            }`}
            onClick={selectedIndex !== 0 ? moveUp : undefined}
          >
            이전
          </div>

          <div className="label">현재</div>

          <div
            className={`label clickable ${
              selectedIndex === people.length - 1 ? "disabled" : ""
            }`}
            onClick={
              selectedIndex !== people.length - 1 ? moveDown : undefined
            }
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
