import { useEffect, useRef, useState } from 'react';
import './App.css'
import { supabase } from './lib/supabase'
import { getPeopleFromGoogle, getPeopleFromLocal, type DataSource } from './services/peopleService';
import { CloseIcon, EnterIcon } from './icons/fullScreenIcon';
import PickerItem from './components/Item';
import GoToTopIcon from './icons/goToTopIcon';
import { useGoogleCsv } from './hooks/useGoogleCsv';
import { loadPersistedState, useAppPersist } from './hooks/useAppPersist';
import { MoonIcon, SunIcon, SystemIcon } from './icons/darkModeIcon';
import toast, { Toaster } from 'react-hot-toast';
import SearchInput from './components/SearchInput';
import SearchOverlay from './components/SearchOverlay';
import { useWakeLock } from './hooks/useWakeLock';

function App() {
  const [people, setPeople] = useState<{id: string, name: string}[]>([]);
  const [query, setQuery] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showScale, setShowScale] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  // const [selectedSheet, setSelectedSheet] = useState<string>("2024-02-26");
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimer =useRef<number | null>(null);
  const scaleHideTimer = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const persisted = loadPersistedState();

  const [isFullscreen, setIsFullscreen] = useState(
    persisted?.isFullscreen ?? false
  );

  const [uiScale, setUiScale] = useState(
    persisted?.uiScale ?? 1
  );
  
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
  const [remoteIndex, setRemoteIndex] = useState<number | null>(null)

  const {
    url: googleUrl,
    setUrl: setGoogleUrl,
    error,
    isLoading,
    load
  } = useGoogleCsv(persisted?.googleUrl ?? "");
  const [remoteGoogleUrl, setRemoteGoogleUrl] = useState<string | null>(null)

  useAppPersist({
    dataSource,
    googleUrl,
    isFullscreen,
    uiScale,
    darkMode,
    useSystemTheme,
    selectedIndex
  });

  // Connect DB
  useEffect(() => {
    console.log("Supabase connected:", supabase)
  }, [])

  const [roomId, setRoomId] = useState<string | null>(null);
  const [clientId] = useState(() =>
    crypto.randomUUID().slice(0, 8)
  );
  // const [hostId, setHostId] = useState<string | null>(null);

  // const isHost = hostId === clientId;

  const getRoomFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room");
  };

  useEffect(() => {
    let room = getRoomFromUrl()

    if (!room) {
      // room 없으면 자동 생성
      room = crypto.randomUUID().slice(0, 8)

      const newUrl = `${window.location.origin}?room=${room}`
      window.history.replaceState({}, "", newUrl)
    }

    setRoomId(room)
  }, [])

  useEffect(() => {
    if (!roomId) return;

    const initRoom = async () => {
      // 1. room 존재하는지 확인
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("room_id", roomId)

      if (error) {
        console.error("Room fetch error:", error)
        return
      }

      // 2. 없으면 생성
      if (!data || data.length === 0) {
        console.log("Room not found. Creating new room...")

        const { error: insertError } = await supabase
          .from("sessions")
          .insert({
            room_id: roomId,
            selected_index: 0,
            sheet_url: null,
            host_id: clientId,
          })

        if (insertError) {
          console.error("Room creation error:", insertError);
        } else {
          console.log("Room created.");
          // setHostId(clientId);
        }
      } else {
        const room = data[0];
        console.log("Room found:", room);
        
        // setHostId(room.host_id ?? null);

        // host가 아직 없으면 내가 차지
        if (!room.host_id) {
          await supabase
            .from("sessions")
            .update({ host_id: clientId })
            .eq("room_id", roomId);

          // setHostId(clientId);
        }
        
        // DB 값으로 초기화        
        setRemoteIndex(room.selected_index ?? 0);
        setSelectedIndex(room.selected_index ?? 0);

        setRemoteGoogleUrl(room.sheet_url ?? null);
        setGoogleUrl(room.sheet_url ?? null);
      }
    }

    initRoom()
  }, [roomId]);

  useEffect(() => {
    // if (!isHost) return;
    if (!roomId) return;

    if (remoteIndex === null) return;
    if (selectedIndex === remoteIndex) return;

    const updateIndex = async () => {
      await supabase
        .from("sessions")
        .update({ selected_index: selectedIndex })
        .eq("room_id", roomId);
    };

    updateIndex();
  }, [selectedIndex, roomId]);

  useEffect(() => {
    // if (!isHost) return;
    if (!roomId) return;

    if (remoteGoogleUrl === null && googleUrl === null) return
    if (googleUrl === remoteGoogleUrl) return

    const updateSheetUrl = async () => {
      await supabase
        .from("sessions")
        .update({ sheet_url: googleUrl })
        .eq("room_id", roomId)
    }

    updateSheetUrl()
  }, [googleUrl, roomId])

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Realtime update received:", payload);

          const newIndex = payload.new.selected_index;
          const newGoogleUrl = payload.new.sheet_url;

          setRemoteIndex(newIndex);
          setSelectedIndex(newIndex);

          setRemoteGoogleUrl(newGoogleUrl);
          setGoogleUrl(newGoogleUrl);
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      })
      

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

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

  // Search
  const handleSearch = () => {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) return false;

    const tokens = trimmed.split(/\s+/);

    const foundIndex = people.findIndex((person) =>{
      const searchable = `${person.id} ${person.name}`.toLowerCase();

      return tokens.every(token => searchable.includes(token));
    });

    if (foundIndex !== -1) {
      setSelectedIndex(foundIndex);
      return true;
    }

    return false;
  };

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
      const isTyping =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === "f") {
        e.preventDefault();
        if (isFullscreen) setIsSearchMode(prev => !prev);
        else {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      }
      
      if (e.key === "Escape") {
        if (
          !isFullscreen &&
          document.activeElement === searchInputRef.current
        ) {
          searchInputRef.current?.blur();
          return;
        }
      }

      if (isTyping) return;
      if (isSearchMode) return;

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
      if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        setSelectedIndex(0);
      }
      if (e.key.toLowerCase() === "f" && !e.ctrlKey) toggleFullscreen();
      if (e.key.toLowerCase() === "d") toggleDarkMode();
      if (
        isFullscreen &&
        e.code === "Comma"
      ) {
        setUiScale(prev => {
          const next = clampSlider(prev - 0.05);
          showScaleToast(next);
          return next;
        });
      }
      if (
        isFullscreen &&
        e.code === "Period"
      ) {
        setUiScale(prev => {
          const next = clampSlider(prev + 0.05);
          showScaleToast(next);
          return next;
        });
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "0") {
        setUiScale(1);
        showScaleToast(1);
      }
      if (e.key.toLowerCase() === "h") setIsHelpOpen(true);
      if (
        isHelpOpen &&
        e.key === "Escape"
      ) setIsHelpOpen(false); // 이거 왜 escape 안 먹힘?
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [people.length, selectedIndex, isFullscreen, isSearchMode]);

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
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(!!fullscreenElement);
      if (!fullscreenElement) setIsSearchMode(false);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useWakeLock(isFullscreen);


  // Scale UI
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ui-scale",
      uiScale.toString()
    );
  }, [uiScale]);

  const clampSlider = (value: number) => {
    if (value > 2) return 2;
    if (value < 0.5) return 0.5;
    return value;
  };

  const handleScaleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = rect.bottom - e.clientY;
    const percent = offset / rect.height;

    const newScale = Math.round((0.5 + percent * (2 - 0.5))*10)/10; // min=0.5, max=2, step=0.1

    setUiScale(clampSlider(newScale));
  };

  const showScaleToast = (uiScale: number) => {
    toast.custom((t) => (
      <div className={`toast-scale ${t.visible ? "enter" : "leave"}`}>
        <div className="toast-scale__label">UI SCALE</div>
        <div className="toast-scale__value">⨉{uiScale.toFixed(1)}</div>
      </div>
    ), { id: "toast-scale" });
  }

  function startScaleHideTimer() {
    if (scaleHideTimer.current) clearTimeout(scaleHideTimer.current);

    scaleHideTimer.current = window.setTimeout(() => {
      setShowScale(false);
    }, 3000);
  }

  useEffect(() => {
    if (!showScale) return;

    startScaleHideTimer();

    return () => {
      if (scaleHideTimer.current) clearTimeout(scaleHideTimer.current);
    };
  }, [showScale]);

  // Dark Mode
  const toggleDarkMode = () => {
    setUseSystemTheme(false);
    setDarkMode(prev => !prev);
  };

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

        <SearchInput 
          ref={searchInputRef}
          query={query} 
          onChange={setQuery}
          onSubmit={handleSearch} 
        />
      </div>

      <div className='panel right'>
        <div className='source-row'>
          <button
            onClick={toggleDarkMode}
            title={`다크모드: ${darkMode ? "dark" : "light"}`}
          >
            <div className={`icon ${darkMode ? "" : "close"}`}>
              {darkMode ? <MoonIcon /> : <SunIcon />}
            </div>
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
            title={`전체화면(${Math.round(uiScale * 10)/10}배)`}
            onMouseDown={() => {
              longPressTimer.current = window.setTimeout(() => {
                setShowScale(true);
              }, 400);
            }}
            onMouseUp={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              };
            }}
            onClick={() => {
              if (!showScale) toggleFullscreen();
              else setShowScale(false);
            }}
          >
            <div className={`icon ${showScale ? "close" : ""}`}>
              {showScale ? <CloseIcon /> : <EnterIcon />}
            </div>
          </button>
        </div>

        <div 
          className={`scale-pill ${showScale ? "open" : ""}`}
          title={`값: ${Math.round(uiScale*10)/10}`}
          onClick={handleScaleClick}
          onMouseMove={(e) => {
            e.preventDefault();
            if (e.buttons === 1) handleScaleClick(e);
          }}
          onMouseEnter={() => {
            if (scaleHideTimer.current) clearTimeout(scaleHideTimer.current);
          }}
          onMouseLeave={() => startScaleHideTimer()}
        >
          <div
            className="scale-fill"
            style={{ height: `${(uiScale - 0.5) / (2 - 0.5) * 100}%` }}
          />

          <div 
            className='scale-marker'
            title='1.0'
            onClick={(e) => {
              e.stopPropagation();
              showScaleToast(1);
              setUiScale(1);
            }}
          />
        </div>

        <button
          className="help-button"
          onClick={() => setIsHelpOpen(true)}
        >
          ?
        </button>
      </div>

      {isHelpOpen && (
        <div className="help-modal__overlay" onClick={() => setIsHelpOpen(false)}>
          <div
            className="help-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help-modal__header">
              <h2>Keyboard Guide</h2>
              <button
                className="help-close"
                onClick={() => setIsHelpOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="help-modal__content">
              <div className="help-modal__shortcut">
                <span className="help-modal__key">↑ ↓</span>
                <span className="help-modal__desc">Move selection</span>
              </div>
              <div className="help-modal__shortcut">
                <span className="help-modal__key">F</span>
                <span className="help-modal__desc">Toggle Fullscreen</span>
              </div>
              <div className="help-modal__shortcut">
                <span className="help-modal__key">D</span>
                <span className="help-modal__desc">Toggle Dark Mode</span>
              </div>
              <div className="help-modal__shortcut">
                <span className="help-modal__key">, / .</span>
                <span className="help-modal__desc">Adjust UI Scale</span>
              </div>
              <div className="help-modal__shortcut">
                <span className="help-modal__key">N</span>
                <span className="help-modal__desc">Reset Scale</span>
              </div>
              <div className="help-modal__shortcut">
                <span className="help-modal__key">ESC</span>
                <span className="help-modal__desc">Close Help</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        className={`container ${isFullscreen ? "fullscreen" : ""}`}
        style={{ "--ui-scale": uiScale } as React.CSSProperties}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Toaster
          position="bottom-center"
          toastOptions={{ 
            duration: 800,
          }}
        />

        {isSearchMode && (
          <SearchOverlay
            query={query}
            setQuery={setQuery}
            onSubmit={handleSearch}
            onClose={() => setIsSearchMode(false)}
          />
        )}

        {!isFullscreen && (
          <button
            className={`scroll-top-button ${selectedIndex > 0 ? "show" : ""}`}
            onClick={() => setSelectedIndex(0)}
          >
            <GoToTopIcon />
          </button>
        )}

        <div className="container__labelBox">
          <div
            className={`container__label clickable ${
              selectedIndex === 0 ? "disabled" : ""
            }`}
            onClick={selectedIndex !== 0 ? moveUp : undefined}
          >
            이전
          </div>

          <div className="container__label">현재</div>

          <div
            className={`container__label clickable ${
              selectedIndex === people.length - 1 ? "disabled" : ""
            }`}
            onClick={
              selectedIndex !== people.length - 1 ? moveDown : undefined
            }
          >
            다음
          </div>
        </div>

        <div className="container__window">
          <div
            className="container__click-zone up"
            onClick={moveUp}
            onMouseDown={(e) => {e.preventDefault();}}
          />

          <div
            className="container__click-zone down"
            onClick={moveDown}
            onMouseDown={(e) => {e.preventDefault();}}
          />

          {people.map((person, index) => (
            <PickerItem
              key={person.id}
              title={`${person.id} ${person.name}`}
              text={`${person.id} ${person.name}`}
              isActive={index === selectedIndex}
              distance={index - selectedIndex}
              isFullscreen={isFullscreen}
              uiScale={uiScale}
            />
          ))}
          <div className="highlight" />
        </div>
      </div>
    </>
  );
}

export default App
