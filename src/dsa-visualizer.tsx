import { Plus } from 'lucide-react';
import Graph from './components/Graph';
import InputRow from './components/InputRow';
import InputsFooter from './components/FutureFeatures';
import useArrays from './hooks/useArrays';

const DSAVisualizer = () => {
  const {
    arrays,
    addNewArray,
    removeArray,
    updateArray,
  } = useArrays();
  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Input Controls Panel */}
        <div className="lg:col-span-1 space-y-4 max-h-screen overflow-scroll">
          <InputsHeader addNewArray={addNewArray} />
          <div className="space-y-3 max-h-auto overflow-y-auto">
            {arrays.map((arrayData) => <InputRow
              key={arrayData.id}
              arrayData={arrayData}
              removeArray={removeArray}
              updateArray={updateArray}
              showTrash={arrays.length > 1}
            />)}
          </div>
          <InputsFooter />
        </div>

        {/* Graphing Area */}
        <div className="lg:col-span-2 xl:col-span-3">
          <Graph arrays={arrays} />
        </div>
      </div>
    </div>
  );
};

export default DSAVisualizer;

const InputsHeader = ({addNewArray}) => {
  return (
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
  );
};
