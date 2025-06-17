import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Animated, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Rect, Path } from 'react-native-svg';


type PaperStyle = 'grid' | 'ruled' | 'no lines';

interface PaperBackgroundProps {
  style: PaperStyle;
  color: string;
}

const PaperBackground: React.FC<PaperBackgroundProps> = ({ style, color }) => {
  if (style === 'no lines') return null;

  const lineColor = 'rgba(0, 0, 0, 0.1)';
  const lineWidth = 1;
  const gridSize = 20;
  const ruledLineSpacing = 30;

  if (style === 'grid') {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Vertical lines */}
        {Array.from({ length: Math.ceil(1000 / gridSize) }).map((_, i) => (
          <Line
            key={`v${i}`}
            x1={i * gridSize}
            y1="0"
            x2={i * gridSize}
            y2="100%"
            stroke={lineColor}
            strokeWidth={lineWidth}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: Math.ceil(1000 / gridSize) }).map((_, i) => (
          <Line
            key={`h${i}`}
            x1="0"
            y1={i * gridSize}
            x2="100%"
            y2={i * gridSize}
            stroke={lineColor}
            strokeWidth={lineWidth}
          />
        ))}
      </Svg>
    );
  }

  if (style === 'ruled') {
    return (
      <Svg style={StyleSheet.absoluteFill}>
        {/* Horizontal ruled lines */}
        {Array.from({ length: Math.ceil(1000 / ruledLineSpacing) }).map((_, i) => (
          <Line
            key={`r${i}`}
            x1="0"
            y1={i * ruledLineSpacing}
            x2="100%"
            y2={i * ruledLineSpacing}
            stroke={lineColor}
            strokeWidth={lineWidth}
          />
        ))}
      </Svg>
    );
  }

  return null;
};

type DrawTool = 'pen' | 'highlighter' | 'shapes' | 'text';

interface DrawToolOption {
  id: DrawTool;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ShapeOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  width: number;
  type: 'pen' | 'highlighter';
}

export default function Notes() {
  const [selectedTab, setSelectedTab] = useState('home');
  const [selectedStyleOption, setSelectedStyleOption] = useState('pagecolor');
  const [selectedDrawTool, setSelectedDrawTool] = useState<DrawTool>('pen');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPaperOptions, setShowPaperOptions] = useState(false);
  const [showPenOptions, setShowPenOptions] = useState(false);
  const [showHighlighterOptions, setShowHighlighterOptions] = useState(false);
  const [showShapeOptions, setShowShapeOptions] = useState(false);
  const [selectedShape, setSelectedShape] = useState<string>('rectangle');
  const [shapeColor, setShapeColor] = useState('#000000');
  const [shapeWidth, setShapeWidth] = useState(2);
  const [pageColor, setPageColor] = useState('#ffffff');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('no lines');
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [highlighterColor, setHighlighterColor] = useState('rgba(255, 255, 0, 0.5)');
  const [highlighterWidth, setHighlighterWidth] = useState(20);
  const penSliderPosition = new Animated.Value(0);
  const highlighterSliderPosition = new Animated.Value(0);
  const shapeSliderPosition = new Animated.Value(0);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<DrawingPoint[][]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef(null);
  const [undoStack, setUndoStack] = useState<DrawingPoint[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPoint[][]>([]);
  const [isEraserActive, setIsEraserActive] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#808080',
    '#800000', '#008000', '#000080', '#808000'
  ];

  const highlighterColors = [
    'rgba(255, 255, 0, 0.5)',  // Yellow
    'rgba(255, 200, 0, 0.5)',  // Orange
    'rgba(255, 0, 0, 0.5)',    // Red
    'rgba(0, 255, 0, 0.5)',    // Green
    'rgba(0, 200, 255, 0.5)',  // Light Blue
    'rgba(255, 0, 255, 0.5)',  // Pink
    'rgba(128, 0, 128, 0.5)',  // Purple
    'rgba(255, 165, 0, 0.5)',  // Orange
    'rgba(0, 128, 0, 0.5)',    // Dark Green
    'rgba(0, 0, 255, 0.5)',    // Blue
    'rgba(128, 128, 0, 0.5)',  // Olive
    'rgba(128, 0, 0, 0.5)',    // Maroon
  ];

  const shapes: ShapeOption[] = [
    { id: 'rectangle', label: 'Rectangle', icon: 'square-outline' },
    { id: 'circle', label: 'Circle', icon: 'ellipse-outline' },
    { id: 'triangle', label: 'Triangle', icon: 'triangle-outline' },
    { id: 'line', label: 'Line', icon: 'remove-outline' },
    { id: 'arrow', label: 'Arrow', icon: 'arrow-forward-outline' },
    { id: 'star', label: 'Star', icon: 'star-outline' },
  ];

  const handleScreenTouch = () => {
    if (showDropdowns) {
      setShowPenOptions(false);
      setShowHighlighterOptions(false);
      setShowShapeOptions(false);
      setShowColorPicker(false);
      setShowPaperOptions(false);
      setShowDropdowns(false);
    }
  };

  const penPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.x0 - 20, 200));
      penSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 9) + 1;
      setPenWidth(newWidth);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.moveX - 20, 200));
      penSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 9) + 1;
      setPenWidth(newWidth);
    },
  });

  const highlighterPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.x0 - 20, 200));
      highlighterSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 30) + 10;
      setHighlighterWidth(newWidth);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.moveX - 20, 200));
      highlighterSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 30) + 10;
      setHighlighterWidth(newWidth);
    },
  });

  const shapePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.x0 - 20, 200));
      shapeSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 9) + 1;
      setShapeWidth(newWidth);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, Math.min(gestureState.moveX - 20, 200));
      shapeSliderPosition.setValue(newPosition);
      const newWidth = Math.round((newPosition / 200) * 9) + 1;
      setShapeWidth(newWidth);
    },
  });

  const drawingPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      if (isEraserActive) {
        const { locationX, locationY } = event.nativeEvent;
        handleEraserTouch(locationX, locationY);
        return;
      }
      if (selectedDrawTool !== 'pen' && selectedDrawTool !== 'highlighter') return;
      setIsDrawing(true);
      const { locationX, locationY } = event.nativeEvent;
      const newPoint = {
        x: locationX,
        y: locationY,
        color: selectedDrawTool === 'pen' ? penColor : highlighterColor,
        width: selectedDrawTool === 'pen' ? penWidth : highlighterWidth,
        type: selectedDrawTool as 'pen' | 'highlighter'
      };
      setCurrentPath([newPoint]);
    },
    onPanResponderMove: (event) => {
      if (isEraserActive) {
        const { locationX, locationY } = event.nativeEvent;
        handleEraserTouch(locationX, locationY);
        return;
      }
      if (!isDrawing || (selectedDrawTool !== 'pen' && selectedDrawTool !== 'highlighter')) return;
      const { locationX, locationY } = event.nativeEvent;
      const newPoint = {
        x: locationX,
        y: locationY,
        color: selectedDrawTool === 'pen' ? penColor : highlighterColor,
        width: selectedDrawTool === 'pen' ? penWidth : highlighterWidth,
        type: selectedDrawTool as 'pen' | 'highlighter'
      };
      setCurrentPath(prev => [...prev, newPoint]);
    },
    onPanResponderRelease: () => {
      if (isEraserActive) return;
      if (!isDrawing) return;
      setIsDrawing(false);
      setDrawingPoints(prev => [...prev, currentPath]);
      setCurrentPath([]);
    },
  });

  const paperStyles = [
    { id: 'grid' as PaperStyle, label: 'Grid Lines' },
    { id: 'ruled' as PaperStyle, label: 'Ruled Lines' },
    { id: 'no lines' as PaperStyle, label: 'No Lines' }
  ];

  const drawTools: DrawToolOption[] = [
    { id: 'pen', label: 'Pen', icon: 'pencil' },
    { id: 'highlighter', label: 'Highlighter', icon: 'brush' },
    { id: 'shapes', label: 'Shapes', icon: 'shapes' },
    { id: 'text', label: 'Text', icon: 'text' }
  ];

  const renderColorPicker = () => (
    <View style={styles.dropdownContainer}>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorOption, { backgroundColor: color }]}
            onPress={() => {
              setPageColor(color);
              setShowColorPicker(false);
            }}
          />
        ))}
      </View>
    </View>
  );

  const renderPaperOptions = () => (
    <View style={styles.dropdownContainer}>
      {paperStyles.map((style) => (
        <TouchableOpacity
          key={style.id}
          style={[
            styles.paperOption,
            paperStyle === style.id && styles.selectedPaperOption
          ]}
          onPress={() => {
            setPaperStyle(style.id);
            setShowPaperOptions(false);
          }}
        >
          <Text style={styles.paperOptionText}>{style.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPenOptions = () => (
    <View style={styles.dropdownContainer}>
      <View style={styles.penOptionsContainer}>
        <Text style={styles.penOptionTitle}>Pen Color</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                penColor === color && styles.selectedColorOption
              ]}
              onPress={() => {
                setPenColor(color);
              }}
            />
          ))}
        </View>
        
        <Text style={styles.penOptionTitle}>Pen Width</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderFill,
                {
                  width: penSliderPosition,
                  backgroundColor: penColor,
                },
              ]}
            />
            <Animated.View
              {...penPanResponder.panHandlers}
              style={[
                styles.sliderThumb,
                {
                  left: penSliderPosition,
                  backgroundColor: penColor,
                },
              ]}
            />
          </View>
          <Text style={styles.sliderValue}>{penWidth}px</Text>
        </View>
      </View>
    </View>
  );

  const renderHighlighterOptions = () => (
    <View style={styles.dropdownContainer}>
      <View style={styles.penOptionsContainer}>
        <Text style={styles.penOptionTitle}>Highlighter Color</Text>
        <View style={styles.colorGrid}>
          {highlighterColors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                highlighterColor === color && styles.selectedColorOption
              ]}
              onPress={() => {
                setHighlighterColor(color);
              }}
            />
          ))}
        </View>
        
        <Text style={styles.penOptionTitle}>Highlighter Width</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderFill,
                {
                  width: highlighterSliderPosition,
                  backgroundColor: highlighterColor,
                },
              ]}
            />
            <Animated.View
              {...highlighterPanResponder.panHandlers}
              style={[
                styles.sliderThumb,
                {
                  left: highlighterSliderPosition,
                  backgroundColor: highlighterColor,
                },
              ]}
            />
          </View>
          <Text style={styles.sliderValue}>{highlighterWidth}px</Text>
        </View>
      </View>
    </View>
  );

  const renderShapeOptions = () => (
    <View style={styles.dropdownContainer}>
      <View style={styles.penOptionsContainer}>
        <Text style={styles.penOptionTitle}>Shape Type</Text>
        <View style={styles.shapeGrid}>
          {shapes.map((shape) => (
            <TouchableOpacity
              key={shape.id}
              style={[
                styles.shapeOption,
                selectedShape === shape.id && styles.selectedShapeOption
              ]}
              onPress={() => {
                setSelectedShape(shape.id);
              }}
            >
              <Ionicons 
                name={shape.icon} 
                size={24} 
                color={selectedShape === shape.id ? '#fff' : '#333'} 
              />
              <Text style={[
                styles.shapeOptionText,
                selectedShape === shape.id && styles.selectedShapeOptionText
              ]}>
                {shape.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.penOptionTitle}>Shape Color</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                shapeColor === color && styles.selectedColorOption
              ]}
              onPress={() => {
                setShapeColor(color);
              }}
            />
          ))}
        </View>
        
        <Text style={styles.penOptionTitle}>Line Width</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderFill,
                {
                  width: shapeSliderPosition,
                  backgroundColor: shapeColor,
                },
              ]}
            />
            <Animated.View
              {...shapePanResponder.panHandlers}
              style={[
                styles.sliderThumb,
                {
                  left: shapeSliderPosition,
                  backgroundColor: shapeColor,
                },
              ]}
            />
          </View>
          <Text style={styles.sliderValue}>{shapeWidth}px</Text>
        </View>
      </View>
    </View>
  );

  const renderDrawTools = () => (
    <View style={styles.subTabBar}>
      <View style={styles.subTabRow}>
        {drawTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.drawToolItem,
              selectedDrawTool === tool.id && styles.selectedDrawTool
            ]}
            onPress={() => {
              setSelectedDrawTool(tool.id);
              if (tool.id === 'pen') {
                setShowPenOptions(!showPenOptions);
                setShowHighlighterOptions(false);
                setShowShapeOptions(false);
                setShowDropdowns(!showPenOptions);
              } else if (tool.id === 'highlighter') {
                setShowHighlighterOptions(!showHighlighterOptions);
                setShowPenOptions(false);
                setShowShapeOptions(false);
                setShowDropdowns(!showHighlighterOptions);
              } else if (tool.id === 'shapes') {
                setShowShapeOptions(!showShapeOptions);
                setShowPenOptions(false);
                setShowHighlighterOptions(false);
                setShowDropdowns(!showShapeOptions);
              } else {
                setShowPenOptions(false);
                setShowHighlighterOptions(false);
                setShowShapeOptions(false);
                setShowDropdowns(false);
              }
            }}
          >
            <View style={styles.drawToolContent}>
              <Ionicons 
                name={tool.icon} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.drawToolText}>{tool.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {showPenOptions && renderPenOptions()}
      {showHighlighterOptions && renderHighlighterOptions()}
      {showShapeOptions && renderShapeOptions()}
    </View>
  );

  const renderDrawingCanvas = () => {
    return (
      <Svg
        ref={svgRef}
        style={StyleSheet.absoluteFill}
        {...drawingPanResponder.panHandlers}
      >
        {drawingPoints.map((points, idx) => {
          if (points.length < 2) return null;
          const pathData = points.reduce((acc, point, index) => {
            const command = index === 0 ? 'M' : 'L';
            return `${acc} ${command} ${point.x} ${point.y}`;
          }, '');
          return (
            <Path
              key={idx}
              d={pathData}
              stroke={points[0].color}
              strokeWidth={points[0].width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={points[0].type === 'highlighter' ? 0.5 : 1}
            />
          );
        })}
        {/* Current path while drawing */}
        {currentPath.length > 1 && (
          <Path
            d={currentPath.reduce((acc, point, index) => {
              const command = index === 0 ? 'M' : 'L';
              return `${acc} ${command} ${point.x} ${point.y}`;
            }, '')}
            stroke={currentPath[0].color}
            strokeWidth={currentPath[0].width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={currentPath[0].type === 'highlighter' ? 0.5 : 1}
          />
        )}
      </Svg>
    );
  };

  // Undo, Redo, Clear All, Eraser Handlers
  const handleUndo = () => {
    if (drawingPoints.length === 0) return;
    setUndoStack(prev => [...prev, drawingPoints[drawingPoints.length - 1]]);
    setRedoStack([]);
    setDrawingPoints(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, last]);
    setDrawingPoints(prev => [...prev, last]);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setUndoStack(prev => [...prev, ...drawingPoints]);
    setDrawingPoints([]);
    setRedoStack([]);
  };

  // Eraser logic: remove points near touch
  const handleEraserTouch = (x: number, y: number) => {
    const eraserRadius = 20;
    setDrawingPoints(prev => prev.map(path => path.filter(point => {
      const dx = point.x - x;
      const dy = point.y - y;
      return Math.sqrt(dx * dx + dy * dy) > eraserRadius;
    })).filter(path => path.length > 0));
  };

  // Right-side vertical tab for Undo, Redo, Clear All, Eraser
  const renderRightTab = () => (
    <View style={styles.rightTabContainer}>
      <TouchableOpacity style={styles.rightTabButton} onPress={handleUndo}>
        <Ionicons name="arrow-undo-outline" size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rightTabButton} onPress={handleRedo}>
        <Ionicons name="arrow-redo-outline" size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.rightTabButton} onPress={handleClearAll}>
        <Ionicons name="trash-outline" size={24} color="#333" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.rightTabButton, isEraserActive && styles.eraserActive]} onPress={() => setIsEraserActive(e => !e)}>
        <Ionicons name="remove-circle-outline" size={24} color={isEraserActive ? '#fff' : '#333'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={handleScreenTouch}>
      <View style={[styles.container, { backgroundColor: pageColor }]}>
        <PaperBackground style={paperStyle} color={pageColor} />
        {renderDrawingCanvas()}
        {renderRightTab()}

        {/* Top Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'home' && styles.selectedTab]} 
            onPress={() => setSelectedTab('home')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="home-outline" size={24} color="#fff" />
              <Text style={styles.tabText}>Home</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'draw' && styles.selectedTab]}
            onPress={() => setSelectedTab('draw')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="pencil-outline" size={24} color="#fff" />
              <Text style={styles.tabText}>Draw</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'style' && styles.selectedTab]}
            onPress={() => setSelectedTab('style')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="brush-outline" size={24} color="#fff" />
              <Text style={styles.tabText}>Style</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, selectedTab === 'insert' && styles.selectedTab]}
            onPress={() => setSelectedTab('insert')}
          >
            <View style={styles.tabContent}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.tabText}>Insert</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Draw Tools Sub Tab Bar */}
        {selectedTab === 'draw' && renderDrawTools()}

        {/* Style Sub Tab Bar */}
        {selectedTab === 'style' && (
          <View style={styles.subTabBar}>
            <View style={styles.subTabRow}>
              <View style={styles.subTabWrapper}>
                <TouchableOpacity 
                  style={[styles.subTabItem, selectedStyleOption === 'pagecolor' && styles.selectedSubTab]}
                  onPress={() => {
                    setSelectedStyleOption('pagecolor');
                    setShowColorPicker(!showColorPicker);
                    setShowPaperOptions(false);
                  }}
                >
                  <Text style={styles.subTabText}>Page Color</Text>
                </TouchableOpacity>
                {showColorPicker && renderColorPicker()}
              </View>
              
              <View style={styles.subTabWrapper}>
                <TouchableOpacity 
                  style={[styles.subTabItem, selectedStyleOption === 'paper' && styles.selectedSubTab]}
                  onPress={() => {
                    setSelectedStyleOption('paper');
                    setShowPaperOptions(!showPaperOptions);
                    setShowColorPicker(false);
                  }}
                >
                  <Text style={styles.subTabText}>Paper</Text>
                </TouchableOpacity>
                {showPaperOptions && renderPaperOptions()}
              </View>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#6ec1e4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  subTabBar: {
    backgroundColor: '#a8d8f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  subTabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subTabWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  subTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSubTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  subTabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: 280,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#000',
    transform: [{ scale: 1.1 }],
  },
  paperOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
    minWidth: 200,
  },
  selectedPaperOption: {
    backgroundColor: '#e8f4f8',
  },
  paperOptionText: {
    fontSize: 14,
    color: '#333',
  },
  drawToolItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  drawToolContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedDrawTool: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  drawToolText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  penOptionsContainer: {
    padding: 12,
    width: 300,
  },
  penOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    position: 'relative',
    marginHorizontal: 10,
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    top: -8,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliderValue: {
    fontSize: 14,
    color: '#333',
    width: 40,
    textAlign: 'right',
  },
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  shapeOption: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedShapeOption: {
    backgroundColor: '#6ec1e4',
    borderColor: '#4a9cc7',
  },
  shapeOptionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  selectedShapeOptionText: {
    color: '#fff',
  },
  rightTabContainer: {
    position: 'absolute',
    right: 10,
    top: 100,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  rightTabButton: {
    marginVertical: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eraserActive: {
    backgroundColor: '#6ec1e4',
  },
}); 