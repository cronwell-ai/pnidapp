import { create } from 'zustand';
import { type XYPosition, type Viewport, type Node, type Rect } from 'reactflow';

interface EditorState {
  drawingMode: "circle" | "rectangle" | null;
  isDrawing: boolean;
  drawStart: XYPosition | null;
  drawEnd: XYPosition | null;
  drawId: string | null;
  filter: "Equipments" | "Valves" | "Instruments" | "Pipes" | "All";
  focusBound: Rect | null;
  defaultViewport: Viewport | null;
  focusViewport: Viewport | null;
  setDrawingMode: (drawingMode: "circle" | "rectangle" | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setDrawStart: (drawStart: XYPosition | null) => void;
  setDrawEnd: (drawEnd: XYPosition | null) => void;
  setDrawId: (drawId: string | null) => void;
  setFilter: (filter: "Equipments" | "Valves" | "Instruments" | "Pipes" | "All") => void;
  getColor: (filter: "Equipments" | "Valves" | "Instruments" | "Pipes" | "All") => string;
  setFocusBound: (focusBound: Rect | null) => void;
  setDefaultViewport: (defaultViewport: Viewport | null) => void;
  setFocusViewport: (viewport: Viewport) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  drawingMode: null,
  isDrawing: false,
  drawStart: null,
  drawEnd: null,
  drawId: null,
  filter: "Equipments",
  focusBound: null,
  defaultViewport: null,
  focusViewport: null,
  setDrawingMode: (drawingMode: "circle" | "rectangle" | null) => {
    set({ drawingMode });
    if (drawingMode === null) {
      set({ isDrawing: false });
      set({ drawStart: null });
      set({ drawEnd: null });
      set({ drawId: null });
    }
  },
  setIsDrawing: (isDrawing: boolean) => {
    set({ isDrawing });
    if (!isDrawing) {
      set({ drawStart: null });
      set({ drawEnd: null });
      set({ drawId: null });
    }
  },
  setDrawStart: (drawStart: XYPosition | null) => {
    set({ drawStart });
  },
  setDrawEnd: (drawEnd: XYPosition | null) => {
    set({ drawEnd });
  },
  setDrawId: (drawId: string | null) => {
    set({ drawId });
  },
  setFilter: (filter: "Equipments" | "Valves" | "Instruments" | "Pipes" | "All") => {
    set({ filter });
  },
  getColor:(filter: "Equipments" | "Valves" | "Instruments" | "Pipes" | "All") => {
    switch (filter) {
      case "Equipments":
        return "#3F8AE1";
      case "Valves":
        return "#E1963F";
      case "Instruments":
        return "#8AE13F";
      case "Pipes":
        return "#E13F8A";
      case "All":
        return "#000";
    }
  },
  setFocusBound: (focusBound: Rect | null) => {
    set({ focusBound });
  },
  setDefaultViewport: (defaultViewport: Viewport | null) => {
    set({ defaultViewport });
  },
  setFocusViewport: (viewport: Viewport) => {
    set({ defaultViewport: viewport });
  }
}));

interface ViewerState {
  selectedNode: Node | null;
  setSelectedNode: (selectedNode: Node | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  selectedNode: null,
  setSelectedNode: (selectedNode: Node | null) => {
    set({ selectedNode });
  }
}));