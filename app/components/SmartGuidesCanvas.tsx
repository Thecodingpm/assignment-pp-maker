"use client";
import React, { useEffect, useMemo, useRef, useState, CSSProperties } from "react";
import { Rnd } from "react-rnd";

export type DraggableImageItem = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  alt?: string;
};

type Guides = { v: number | null; h: number | null };

export type SmartGuidesCanvasProps = {
  images: DraggableImageItem[];
  onChange: (next: DraggableImageItem[]) => void;
  snapTolerance?: number;
  snapToCenter?: boolean;
  playSnapSound?: boolean;
  snapSoundUrl?: string;
  className?: string;
  style?: CSSProperties;
  disableResize?: boolean;
};

export default function SmartGuidesCanvas(props: SmartGuidesCanvasProps) {
  const {
    images,
    onChange,
    snapTolerance = 10,
    snapToCenter = true,
    playSnapSound = false,
    snapSoundUrl,
    className,
    style,
    disableResize = true,
  } = props;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapSize, setWrapSize] = useState({ w: 0, h: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guides>({ v: null, h: null });
  const [pulseAxis, setPulseAxis] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDesktopRef = useRef<boolean>(false);
  const [shiftDown, setShiftDown] = useState<boolean>(false);
  const [resizing, setResizing] = useState<{ id: string | null; w: number; h: number; x: number; y: number }>({ id: null, w: 0, h: 0, x: 0, y: 0 });

  useEffect(() => {
    if (!playSnapSound) return;
    if (!snapSoundUrl) return;
    audioRef.current = new Audio(snapSoundUrl);
  }, [playSnapSound, snapSoundUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer:fine)");
    isDesktopRef.current = mq.matches;
    const onChange = () => (isDesktopRef.current = mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Track Shift for aspect ratio override
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftDown(true); };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftDown(false); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect;
      setWrapSize({ w: r.width, h: r.height });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const itemsById = useMemo(() => {
    const m = new Map<string, DraggableImageItem>();
    images.forEach((it) => m.set(it.id, it));
    return m;
  }, [images]);

  const snapTargets = useMemo(() => {
    const edgeX: number[] = [];
    const centerX: number[] = [];
    const edgeY: number[] = [];
    const centerY: number[] = [];
    images.forEach((it) => {
      edgeX.push(it.x, it.x + it.width);
      centerX.push(it.x + it.width / 2);
      edgeY.push(it.y, it.y + it.height);
      centerY.push(it.y + it.height / 2);
    });
    return { edgeX, centerX, edgeY, centerY };
  }, [images]);

  function snapPosition(dragging: DraggableImageItem, x: number, y: number) {
    let nextX = x;
    let nextY = y;
    let showV: number | null = null;
    let showH: number | null = null;

    const left = x;
    const right = x + dragging.width;
    const cx = x + dragging.width / 2;
    const top = y;
    const bottom = y + dragging.height;
    const cy = y + dragging.height / 2;

    const maybePulse = (axis: "x" | "y", guide: number) => {
      if (axis === "x") setPulseAxis((p) => ({ ...p, x: true }));
      else setPulseAxis((p) => ({ ...p, y: true }));
      setTimeout(() => {
        if (axis === "x") setPulseAxis((p) => ({ ...p, x: false }));
        else setPulseAxis((p) => ({ ...p, y: false }));
      }, 140);
      if (playSnapSound && isDesktopRef.current && audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          void audioRef.current.play();
        } catch {}
      }
      return guide;
    };

    for (const ex of snapTargets.edgeX) {
      if (Math.abs(left - ex) <= snapTolerance) {
        nextX = ex;
        showV = maybePulse("x", ex);
      } else if (Math.abs(right - ex) <= snapTolerance) {
        nextX = ex - dragging.width;
        showV = maybePulse("x", ex);
      }
    }
    for (const cxT of snapTargets.centerX) {
      if (Math.abs(cx - cxT) <= snapTolerance) {
        nextX = cxT - dragging.width / 2;
        showV = maybePulse("x", cxT);
      }
    }
    if (snapToCenter && wrapSize.w > 0) {
      const pageCx = wrapSize.w / 2;
      if (Math.abs(cx - pageCx) <= snapTolerance) {
        nextX = pageCx - dragging.width / 2;
        showV = maybePulse("x", pageCx);
      }
    }

    for (const ey of snapTargets.edgeY) {
      if (Math.abs(top - ey) <= snapTolerance) {
        nextY = ey;
        showH = maybePulse("y", ey);
      } else if (Math.abs(bottom - ey) <= snapTolerance) {
        nextY = ey - dragging.height;
        showH = maybePulse("y", ey);
      }
    }
    for (const cyT of snapTargets.centerY) {
      if (Math.abs(cy - cyT) <= snapTolerance) {
        nextY = cyT - dragging.height / 2;
        showH = maybePulse("y", cyT);
      }
    }
    if (snapToCenter && wrapSize.h > 0) {
      const pageCy = wrapSize.h / 2;
      if (Math.abs(cy - pageCy) <= snapTolerance) {
        nextY = pageCy - dragging.height / 2;
        showH = maybePulse("y", pageCy);
      }
    }
    return { x: nextX, y: nextY, v: showV, h: showH };
  }

  const onDrag = (id: string, dx: number, dy: number) => {
    const it = itemsById.get(id);
    if (!it) return;
    const { x, y, v, h } = snapPosition(it, dx, dy);
    setGuides({ v, h });
    onChange(
      images.map((n) => (n.id === id ? { ...n, x, y } : n))
    );
  };

  const onDragStop = () => {
    setGuides({ v: null, h: null });
  };

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}
    >
      {images.map((it) => {
        const isActive = activeId === it.id;
        return (
          <Rnd
            key={it.id}
            bounds="parent"
            size={{ width: it.width, height: it.height }}
            position={{ x: it.x, y: it.y }}
            onDragStart={() => setActiveId(it.id)}
            onDrag={(e, d) => onDrag(it.id, d.x, d.y)}
            onDragStop={onDragStop}
            enableResizing={disableResize ? false : { top:true, right:true, bottom:true, left:true, topRight:true, bottomRight:true, bottomLeft:true, topLeft:true }}
            lockAspectRatio={!shiftDown}
            dragGrid={[5,5]}
            resizeGrid={[5,5]}
            onResizeStart={(e) => { setResizing({ id: it.id, w: it.width, h: it.height, x: it.x, y: it.y }); setActiveId(it.id); }}
            onResize={(e, dir, ref, delta, pos) => {
              const w = ref.offsetWidth;
              const h = ref.offsetHeight;
              setResizing({ id: it.id, w, h, x: pos.x, y: pos.y });
              onChange(images.map(n=> n.id===it.id ? { ...n, width:w, height:h, x:pos.x, y:pos.y } : n));
            }}
            onResizeStop={(e, dir, ref, delta, pos) => {
              const w = ref.offsetWidth;
              const h = ref.offsetHeight;
              onChange(images.map(n=> n.id===it.id ? { ...n, width:w, height:h, x:pos.x, y:pos.y } : n));
              setResizing({ id: null, w: 0, h: 0, x: 0, y: 0 });
            }}
            style={{
              zIndex: isActive ? 20 : 1,
              transition: isActive ? "none" : "transform .18s cubic-bezier(.4,0,.2,1)",
              cursor: isActive ? "grabbing" : "grab",
            }}
            className={isActive && (pulseAxis.x || pulseAxis.y) ? "snap-feedback" : undefined}
            handleStyles={disableResize ? undefined : {
              top:{height:8,top:-4,background:'rgba(59,130,246,.65)',cursor:'ns-resize',borderRadius:4},
              bottom:{height:8,bottom:-4,background:'rgba(59,130,246,.65)',cursor:'ns-resize',borderRadius:4},
              left:{width:8,left:-4,background:'rgba(59,130,246,.65)',cursor:'ew-resize',borderRadius:4},
              right:{width:8,right:-4,background:'rgba(59,130,246,.65)',cursor:'ew-resize',borderRadius:4},
              topLeft:{width:12,height:12,left:-6,top:-6,background:'#fff',border:'2px solid #3b82f6',borderRadius:6,cursor:'nwse-resize',boxShadow:'0 1px 4px rgba(0,0,0,.25)'},
              topRight:{width:12,height:12,right:-6,top:-6,background:'#fff',border:'2px solid #3b82f6',borderRadius:6,cursor:'nesw-resize',boxShadow:'0 1px 4px rgba(0,0,0,.25)'},
              bottomLeft:{width:12,height:12,left:-6,bottom:-6,background:'#fff',border:'2px solid #3b82f6',borderRadius:6,cursor:'nesw-resize',boxShadow:'0 1px 4px rgba(0,0,0,.25)'},
              bottomRight:{width:12,height:12,right:-6,bottom:-6,background:'#fff',border:'2px solid #3b82f6',borderRadius:6,cursor:'nwse-resize',boxShadow:'0 1px 4px rgba(0,0,0,.25)'}
            }}
          >
            <img
              src={it.src}
              alt={it.alt ?? ""}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 8,
                boxShadow: isActive ? "0 12px 24px rgba(0,0,0,.25)" : "0 4px 10px rgba(0,0,0,.15)",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          </Rnd>
        );
      })}

      {guides.v !== null && (
        <div
          style={{
            position: "absolute",
            left: guides.v,
            top: 0,
            bottom: 0,
            width: 1,
            background: "rgba(59,130,246,1)",
            boxShadow: "0 0 6px rgba(59,130,246,.9)",
            transform: "translateX(-.5px)",
            zIndex: 999,
          }}
        />
      )}

      {guides.h !== null && (
        <div
          style={{
            position: "absolute",
            top: guides.h,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(59,130,246,1)",
            boxShadow: "0 0 6px rgba(59,130,246,.9)",
            transform: "translateY(-.5px)",
            zIndex: 999,
          }}
        />
      )}

      {resizing.id && (
        <div
          style={{
            position: 'absolute',
            left: resizing.x,
            top: Math.max(0, resizing.y - 28),
            background: 'rgba(17,24,39,.9)',
            color: '#fff',
            fontSize: 12,
            padding: '2px 6px',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,.3)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {Math.round(resizing.w)} × {Math.round(resizing.h)}
        </div>
      )}
    </div>
  );
}

// Inject global animation for snap feedback
// Scale from 1.02 to 1.0 over 150ms
// Consumers can override by redefining .snap-feedback
// This is intentionally global so Rnd's wrapper div picks it up
// and does not require CSS modules.
// eslint-disable-next-line @next/next/no-sync-scripts
export const SnapFeedbackStyle = (
  <style jsx global>{`
    @keyframes snapPulse{0%{transform:scale(1.02)}100%{transform:scale(1.0)}}
    .snap-feedback{animation:snapPulse 150ms ease-out forwards}
  `}</style>
);

