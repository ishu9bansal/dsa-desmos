import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graph = ({arrays}) => {
  const svgRef = useRef();

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
      .call(d3.axisBottom(xScale).ticks(maxLength).tickFormat(d => `[${Math.round(d)}]`));

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

  return (<svg ref={svgRef} className="w-full"></svg>);
}

export default Graph;