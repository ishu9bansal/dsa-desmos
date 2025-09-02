import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Plus, Trash2, Eye, EyeOff, BarChart3, TrendingUp, Mountain, RefreshCw, Edit3 } from 'lucide-react';

const DSAVisualizer = () => {
  const [arrays, setArrays] = useState([
    {
      id: 1,
      name: 'Array 1',
      data: [5, 8, 3, 12, 7, 15, 2, 9],
      chartType: 'bar',
      positiveColor: '#4f46e5',
      negativeColor: '#ef4444',
      visible: true
    }
  ]);
  
  const svgRef = useRef();

  const addNewArray = () => {
    const newId = Math.max(...arrays.map(arr => arr.id)) + 1;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    const newArray = {
      id: newId,
      name: `Array ${newId}`,
      data: [],
      chartType: 'line',
      positiveColor: colors[newId % colors.length],
      negativeColor: '#ef4444',
      visible: true
    };
    setArrays([...arrays, newArray]);
  };

  const removeArray = (id) => {
    if (arrays.length > 1) {
      setArrays(arrays.filter(arr => arr.id !== id));
    }
  };

  const updateArray = (id, field, value) => {
    setArrays(arrays.map(arr => 
      arr.id === id ? { ...arr, [field]: value } : arr
    ));
  };

  const handleArrayDataInput = (id, value) => {
    try {
      const newData = value.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
      updateArray(id, 'data', newData);
    } catch (error) {
      console.error('Invalid input format');
    }
  };

  const generateRandomArray = (id) => {
    const length = Math.floor(Math.random() * 8) + 5;
    const newData = Array.from({ length }, () => Math.floor(Math.random() * 40) - 20); // -20 to 20
    updateArray(id, 'data', newData);
  };

  const generateCumulativeArray = (sourceId) => {
    const sourceArray = arrays.find(arr => arr.id === sourceId);
    if (!sourceArray || sourceArray.data.length === 0) return;
    
    const cumulativeData = [];
    let sum = 0;
    sourceArray.data.forEach(value => {
      sum += value;
      cumulativeData.push(sum);
    });
    
    const newId = Math.max(...arrays.map(arr => arr.id)) + 1;
    const newArray = {
      id: newId,
      name: `Cumulative of ${sourceArray.name}`,
      data: cumulativeData,
      chartType: 'line',
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      visible: true
    };
    setArrays([...arrays, newArray]);
  };

  const getChartIcon = (type) => {
    switch(type) {
      case 'bar': return BarChart3;
      case 'line': return TrendingUp;
      case 'area': return Mountain;
      default: return BarChart3;
    }
  };

  const drawVisualization = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const visibleArrays = arrays.filter(arr => arr.visible && arr.data.length > 0);
    if (visibleArrays.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Find global min/max for consistent scaling
    const allData = visibleArrays.flatMap(arr => arr.data);
    const maxLength = Math.max(...visibleArrays.map(arr => arr.data.length));
    
    const yMin = d3.min(allData);
    const yMax = d3.max(allData);
    const yPadding = Math.abs(yMax - yMin) * 0.1 || 1;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, maxLength - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([height, 0]);

    // Background grid lines for indexes
    const indexLines = container.append("g").attr("class", "index-lines");
    for (let i = 0; i < maxLength; i++) {
      indexLines.append("line")
        .attr("x1", xScale(i))
        .attr("x2", xScale(i))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2");
    }

    // Zero line
    if (yMin < 0 && yMax > 0) {
      container.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "#9ca3af")
        .attr("stroke-width", 2);
    }

    // Axes
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `[${Math.round(d)}]`));

    container.append("g")
      .call(d3.axisLeft(yScale));

    // Draw each visible array
    visibleArrays.forEach((arrayData, arrayIndex) => {
      const { data, chartType, positiveColor, negativeColor } = arrayData;

      if (chartType === 'bar') {
        // Bar Chart
        const barWidth = Math.min(width / maxLength * 0.6, 30); // Adaptive bar width
        
        container.selectAll(`.bar-${arrayData.id}`)
          .data(data)
          .enter()
          .append("rect")
          .attr("class", `bar-${arrayData.id}`)
          .attr("x", (_, i) => xScale(i) - barWidth/2 + (arrayIndex * barWidth * 0.3))
          .attr("width", barWidth * 0.8)
          .attr("y", d => d >= 0 ? yScale(d) : yScale(0))
          .attr("height", d => Math.abs(yScale(d) - yScale(0)))
          .attr("fill", d => d >= 0 ? positiveColor : negativeColor)
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 1)
          .attr("opacity", 0.8);

      } else if (chartType === 'line') {
        // Line Chart
        const line = d3.line()
          .x((_, i) => xScale(i))
          .y(d => yScale(d));

        container.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", positiveColor)
          .attr("stroke-width", 3)
          .attr("d", line)
          .attr("opacity", 0.9);

        // Data points
        container.selectAll(`.dot-${arrayData.id}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", `dot-${arrayData.id}`)
          .attr("cx", (_, i) => xScale(i))
          .attr("cy", d => yScale(d))
          .attr("r", 4)
          .attr("fill", d => d >= 0 ? positiveColor : negativeColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

      } else if (chartType === 'area') {
        // Area Chart
        const area = d3.area()
          .x((_, i) => xScale(i))
          .y0(yScale(0))
          .y1(d => yScale(d));

        container.append("path")
          .datum(data)
          .attr("fill", positiveColor)
          .attr("fill-opacity", 0.3)
          .attr("stroke", positiveColor)
          .attr("stroke-width", 2)
          .attr("d", area);

        // Data points
        container.selectAll(`.dot-${arrayData.id}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", `dot-${arrayData.id}`)
          .attr("cx", (_, i) => xScale(i))
          .attr("cy", d => yScale(d))
          .attr("r", 3)
          .attr("fill", d => d >= 0 ? positiveColor : negativeColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      }
    });
  };

  useEffect(() => {
    drawVisualization();
  }, [arrays]);

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DSA Visualization Framework</h1>
        <p className="text-gray-600 mb-6">Multi-array interactive visualizations for data structures and algorithms</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Array Inputs</h3>
              <button
                onClick={addNewArray}
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Array
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {arrays.map((arrayData, index) => (
                <div key={arrayData.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  {/* Header with name and controls */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <Edit3 size={12} className="text-gray-400" />
                      <input
                        type="text"
                        value={arrayData.name}
                        onChange={(e) => updateArray(arrayData.id, 'name', e.target.value)}
                        className="font-medium text-gray-800 bg-transparent border-b border-dashed border-gray-300 hover:border-gray-500 focus:border-blue-500 outline-none transition-colors px-1 py-0.5"
                        placeholder="Array name"
                        title="Click to edit array name"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateArray(arrayData.id, 'visible', !arrayData.visible)}
                        className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${arrayData.visible ? 'text-blue-600' : 'text-gray-400'}`}
                        title={arrayData.visible ? 'Hide array' : 'Show array'}
                      >
                        {arrayData.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      {arrays.length > 1 && (
                        <button
                          onClick={() => removeArray(arrayData.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete array"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Data input */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter numbers: 5, 8, -3, 12, -7, 15"
                        value={arrayData.data.join(', ')}
                        onChange={(e) => handleArrayDataInput(arrayData.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => generateRandomArray(arrayData.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Generate random array"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chart type and colors */}
                  <div className="flex items-center justify-between">
                    {/* Chart type icons */}
                    <div className="flex items-center gap-1">
                      {['bar', 'line', 'area'].map(type => {
                        const IconComponent = getChartIcon(type);
                        return (
                          <button
                            key={type}
                            onClick={() => updateArray(arrayData.id, 'chartType', type)}
                            className={`p-2 rounded-md transition-all ${
                              arrayData.chartType === type 
                                ? 'bg-blue-500 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                            }`}
                            title={`${type.charAt(0).toUpperCase() + type.slice(1)} chart`}
                          >
                            <IconComponent size={16} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Color picker - split circle */}
                    <div className="relative">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(180deg, ${arrayData.positiveColor} 50%, ${arrayData.negativeColor} 50%)`
                        }}
                        title="Click to change colors"
                        onClick={() => {
                          // Toggle a color picker popup or use hidden inputs
                          document.getElementById(`color-pos-${arrayData.id}`).click();
                        }}
                      >
                        <input
                          id={`color-pos-${arrayData.id}`}
                          type="color"
                          value={arrayData.positiveColor}
                          onChange={(e) => updateArray(arrayData.id, 'positiveColor', e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                          title="Positive values color"
                        />
                        <input
                          id={`color-neg-${arrayData.id}`}
                          type="color"
                          value={arrayData.negativeColor}
                          onChange={(e) => updateArray(arrayData.id, 'negativeColor', e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                          title="Negative values color"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {/* Small indicator for negative color */}
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white cursor-pointer hover:scale-125 transition-transform"
                        style={{ backgroundColor: arrayData.negativeColor }}
                        onClick={() => document.getElementById(`color-neg-${arrayData.id}`).click()}
                        title="Change negative color"
                      ></div>
                    </div>
                  </div>

                  {/* Array summary */}
                  {arrayData.data.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Length: <span className="font-mono">{arrayData.data.length}</span></span>
                        <span>Range: <span className="font-mono">[{Math.min(...arrayData.data)}, {Math.max(...arrayData.data)}]</span></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Graphing Area */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Visualization Space</h3>
              <div className="bg-gray-50 border rounded-lg p-4">
                <svg ref={svgRef} className="w-full"></svg>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                {arrays.filter(arr => arr.visible && arr.data.length > 0).map(arrayData => (
                  <div key={arrayData.id} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: arrayData.positiveColor }}
                    ></div>
                    <span className="text-sm text-gray-600">{arrayData.name}</span>
                    <span className="text-xs text-gray-400">({arrayData.chartType})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <FutureFeatures />
        
      </div>
    </div>
  );
};

export default DSAVisualizer;

const FutureFeatures = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">🚀 Next: Pointers & Markers</h3>
      <div className="text-sm text-blue-700">
        Coming soon: Interactive pointers at specific indexes, range selections, and algorithm step visualization!
      </div>
    </div>
  );
}