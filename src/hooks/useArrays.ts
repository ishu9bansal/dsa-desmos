import { useState } from 'react';

export default function useArrays() {
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
    if (arrays.length <= 1) return;
    setArrays(arrays => arrays.filter(arr => arr.id !== id));
  };

  const updateArray = (id, field, value) => {
    setArrays(arrays => arrays.map(arr => 
      arr.id === id ? { ...arr, [field]: value } : arr
    ));
  };

  return { arrays, addNewArray, removeArray, updateArray };
}