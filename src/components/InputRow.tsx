import { Trash2, Eye, EyeOff, BarChart3, TrendingUp, Mountain, RefreshCw, Edit3 } from 'lucide-react';

const InputRow = ({ arrayData, removeArray, updateArray, showTrash }) => {
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

  return (
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
          { showTrash && (
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
        <ChartSelector
          chartType={arrayData.chartType}
          onChange={(type) => updateArray(arrayData.id, 'chartType', type)}
        />

        <ColorPicker
          primaryColor={arrayData.positiveColor}
          onChangePrimary={(color) => updateArray(arrayData.id, 'positiveColor', color)}
          secondaryColor={arrayData.negativeColor}
          onChangeSecondary={(color) => updateArray(arrayData.id, 'negativeColor', color)}
        />
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
  );
}

export default InputRow;

const ColorPicker = ({ primaryColor, onChangePrimary, secondaryColor, onChangeSecondary }) => {
  return (
    <div className="relative">
      <div 
        className="w-8 h-8 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
        style={{ background: primaryColor }}
      >
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => onChangePrimary(e.target.value)}
          className="absolute opacity-0 w-full h-full cursor-pointer"
          title="Positive values color"
        />
      </div>
      {/* Small indicator for negative color */}
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white cursor-pointer hover:scale-125 transition-transform"
        style={{ backgroundColor: secondaryColor }}
      >
        <input
          type="color"
          value={secondaryColor}
          onChange={(e) => onChangeSecondary(e.target.value)}
          className="absolute opacity-0 w-full h-full cursor-pointer"
          title="Negative values color"
        />
      </div>
    </div>
  );
};

const ChartSelector = ({ chartType, onChange }) => {
  const getChartIcon = (type) => {
    switch(type) {
      case 'bar': return BarChart3;
      case 'line': return TrendingUp;
      case 'area': return Mountain;
      default: return BarChart3;
    }
  };
  return (
    <div className="flex items-center gap-1">
      {['bar', 'line', 'area'].map(type => <ChartButton
        key={type}
        type={type}
        active={chartType === type}
        onClick={() => onChange(type)}
        IconComponent={getChartIcon(type)}
      />)}
    </div>
  );
}

const ChartButton = ({ type, active, onClick, IconComponent }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all ${
        active
          ? 'bg-blue-50 text-blue-600 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
      }`}
      title={`${type.charAt(0).toUpperCase() + type.slice(1)} chart`}
    >
      <IconComponent size={16} />
    </button>
  );
}