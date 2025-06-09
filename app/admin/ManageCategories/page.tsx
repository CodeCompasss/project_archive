"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { addDropdownOption, deleteDropdownOption, getDropdownOptions } from "@/server-action/db-actions";

interface DropdownOption {
  id: number;
  category: string;
  option_value: string;
}

export default function ManageCategoriesPage() {
  const [activeTab, setActiveTab] = useState("add"); // State to manage active tab
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const allCategories = await getDropdownOptions("all"); // Fetch all categories
      const uniqueCategories = Array.from(new Set(allCategories.map((option: DropdownOption) => option.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
      <Tabs defaultValue="add" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="add">Add Category Option</TabsTrigger>
          <TabsTrigger value="delete">Delete Category Option</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddCategoryOption fetchCategories={fetchCategories} categories={categories} />
        </TabsContent>
        <TabsContent value="delete">
          <DeleteCategoryOption fetchCategories={fetchCategories} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CategoryManagementProps {
  fetchCategories: () => void;
  categories: string[];
}

function AddCategoryOption({ fetchCategories }: CategoryManagementProps) {
  const [categoryName, setCategoryName] = useState("");
  const [optionValue, setOptionValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || !optionValue) {
      setStatus("Please fill in both fields.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await addDropdownOption(categoryName, optionValue);
      if (result.success) {
        setStatus("Category option added successfully!");
        setCategoryName("");
        setOptionValue("");
        fetchCategories(); // Refresh categories list
      } else {
        setStatus(`Failed to add category option: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding category option:", error);
      setStatus("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Add New Category Option</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
          <Input
            type="text"
            id="categoryName"
            placeholder="e.g., project_types, departments, domains, submission_years"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="optionValue" className="block text-sm font-medium text-gray-700">Option Value</label>
          <Input
            type="text"
            id="optionValue"
            placeholder="e.g., Research Project, Computer Science, Web Development, 2023"
            value={optionValue}
            onChange={(e) => setOptionValue(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Option"}
        </Button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </form>
    </div>
  );
}

function DeleteCategoryOption({ fetchCategories }: CategoryManagementProps) {
  const [categoryName, setCategoryName] = useState("");
  const [optionValue, setOptionValue] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (categoryName) {
        try {
          const options = await getDropdownOptions(categoryName);
          setCategoryOptions(options);
        } catch (error) {
          console.error(`Error fetching options for category ${categoryName}:`, error);
          setCategoryOptions([]);
        }
      } else {
        setCategoryOptions([]);
      }
    };
    fetchOptions();
  }, [categoryName]);

  const handleDelete = async () => {
    if (!categoryName || !optionValue) {
      setStatus("Please select both category and option value.");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await deleteDropdownOption(categoryName, optionValue);
      if (result.success) {
        setStatus("Category option deleted successfully!");
        setCategoryName("");
        setOptionValue("");
        fetchCategories(); // Refresh categories list
      } else {
        setStatus(`Failed to delete category option: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting category option:", error);
      setStatus("An unexpected error occurred.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Delete Existing Category Option</h3>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="deleteCategoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
          <select
            id="deleteCategoryName"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              setOptionValue(""); // Reset option value when category changes
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deleteOptionValue" className="block text-sm font-medium text-gray-700">Option Value</label>
          <select
            id="deleteOptionValue"
            value={optionValue}
            onChange={(e) => setOptionValue(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            disabled={!categoryName}
          >
            <option value="">Select Option</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.option_value}>
                {option.option_value}
              </option>
            ))}
          </select>
        </div>
        {!confirming ? (
          <Button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={loading || !categoryName || !optionValue}
            variant="destructive"
          >
            Delete Option
          </Button>
        ) : (
          <div className="space-x-4">
            <Button onClick={handleDelete} disabled={loading} variant="destructive">
              Confirm Delete
            </Button>
            <Button onClick={() => setConfirming(false)} disabled={loading} variant="outline">
              Cancel
            </Button>
          </div>
        )}
        {status && <p className="mt-2 text-sm">{status}</p>}
      </form>
    </div>
  );
}