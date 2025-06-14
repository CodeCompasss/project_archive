'use client';

import { useState, useEffect } from 'react';

interface CategoryOption {
  optionId?: number;
  optionName: string;
}

interface Category {
  categoryId?: number;
  categoryName: string;
  options: CategoryOption[];
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      console.error("Failed to fetch categories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory({ categoryName: '', options: [] });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCurrentCategory({ ...category });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId }),
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        setCategories(categories.filter((c) => c.categoryId !== categoryId));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
        console.error("Failed to delete category:", e);
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory) return;

    const method = currentCategory.categoryId ? 'PUT' : 'POST';
    const url = '/api/categories';

    // Log the data being sent
    console.log('Sending category data:', JSON.stringify(currentCategory, null, 2));

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCategory),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      fetchCategories();
      setIsModalOpen(false);
      setCurrentCategory(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      console.error("Failed to save category:", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => {
      if (!prev) return null;
      const updatedOptions = [...prev.options];
      updatedOptions[index] = { ...updatedOptions[index], [name]: value };
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddOption = () => {
    setCurrentCategory((prev) => {
      if (!prev) return null;
      return { ...prev, options: [...prev.options, { optionName: '' }] };
    });
  };

  const handleRemoveOption = (index: number) => {
    setCurrentCategory((prev) => {
      if (!prev) return null;
      const updatedOptions = prev.options.filter((_, i) => i !== index);
      return { ...prev, options: updatedOptions };
    });
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 p-4 md:p-6">
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Categories</h1>

        <button
          onClick={handleAddCategory}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-700 w-full md:w-auto"
        >
          Add New Category
        </button>

        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.categoryId}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 overflow-hidden text-ellipsis">
                    {category.options.map(o => o.optionName).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => category.categoryId && handleDeleteCategory(category.categoryId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">{currentCategory?.categoryId ? 'Edit Category' : 'Add New Category'}</h2>
              <form onSubmit={handleSaveCategory}>
                <div className="mb-4">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    type="text"
                    id="categoryName"
                    name="categoryName"
                    value={currentCategory?.categoryName || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>

                <h3 className="text-lg font-bold mb-2">Options</h3>
                {currentCategory?.options.map((option, index) => (
                  <div key={index} className="flex flex-col sm:flex-row mb-2 items-center w-full">
                    <input
                      type="text"
                      name="optionName"
                      value={option.optionName || ''}
                      onChange={(e) => handleOptionChange(index, e)}
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 mr-2 w-full mb-2 sm:mb-0"
                      placeholder="Option Name"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mb-4 w-full sm:w-auto"
                >
                  Add Option
                </button>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 