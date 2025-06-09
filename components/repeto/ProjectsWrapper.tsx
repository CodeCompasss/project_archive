'use client';

import { useState } from 'react';
import ProjectGrid from "./ProjectGrid";
import TabSection from "./TabSection";
import FilterSection from "./FilterSection";
import Navbar from "../Navbar";
import AddProjectFAB from "./AddProjectFAB";
import { InferSelectModel } from "drizzle-orm";
import { projects } from "@/lib/db/schema";

interface FilterOption {
  title: string;
  options: string[];
}

type DbProject = InferSelectModel<typeof projects>;

interface ProjectsWrapperProps {
  initialProjects: DbProject[];
  initialFilters: FilterOption[];
}

export default function ProjectsWrapper({ initialProjects, initialFilters }: ProjectsWrapperProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <FilterSection 
          onFilterSubmit={setFilters} 
          onClearFilters={handleClearFilters}
          initialFilters={initialFilters}
        />
        <div className="flex-1">
          <TabSection activeTab={activeTab} onTabChange={setActiveTab} />
          <ProjectGrid projects={initialProjects} activeTab={activeTab} filters={filters} />
        </div>
        <AddProjectFAB />
      </div>
    </main>
  );
} 