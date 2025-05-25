"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import filtersData from '@/data/filters.json';

interface FilterOption {
  title: string;
  options: string[];
}

// Special filter types interface
interface RangeFilter {
  min: number;
  max: number;
}

interface FilterSectionProps {
  onFilterSubmit?: (selectedFilters: Record<string, string[]>) => void;
  onClearFilters?: () => void;
}

export default function FilterSection({ onFilterSubmit, onClearFilters }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters] = useState<FilterOption[]>(filtersData); 
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  
  // Get current year for year range filter
  const currentYear = new Date().getFullYear();
  // Year range filter state
  const [yearRangeFilter, setYearRangeFilter] = useState<RangeFilter>({
    min: 2020, // Default minimum year
    max: currentYear + 5 // Default maximum year (current year + 5 for future years)
  });


  const toggleDropdown = (filterTitle: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [filterTitle]: !prev[filterTitle]
    }));
  };

  const toggleOption = (filterTitle: string, option: string) => {
    setSelectedOptions(prev => {
      const currentSet = new Set(prev[filterTitle] || []);
      if (currentSet.has(option)) {
        currentSet.delete(option);
      } else {
        currentSet.add(option);
      }
      return {
        ...prev,
        [filterTitle]: currentSet
      };
    });
  };

  const isSelected = (filterTitle: string, option: string) => {
    return selectedOptions[filterTitle]?.has(option) || false;
  };

  const handleSubmit = () => {
    const formattedFilters: Record<string, string[]> = {};
    
    // Add all selected filters except for Year of Submission (which will be handled by range)
    Object.entries(selectedOptions).forEach(([title, optionsSet]) => {
      if (optionsSet.size > 0 && title !== "Year of Submission") {
        formattedFilters[title] = Array.from(optionsSet);
      }
    });
    
    // Generate all years between min and max for the Year of Submission filter
    const yearsInRange: string[] = [];
    for (let year = yearRangeFilter.min; year <= yearRangeFilter.max; year++) {
      yearsInRange.push(year.toString());
    }
    
    // Add the year range to the filters
    if (yearsInRange.length > 0) {
      formattedFilters["Year of Submission"] = yearsInRange;
    }
    
    onFilterSubmit?.(Object.keys(formattedFilters).length > 0 ? formattedFilters : {});
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedOptions({});
    // Reset year range filter to defaults
    setYearRangeFilter({
      min: 2020,
      max: currentYear + 5
    });
    setIsOpen(false);
    onClearFilters?.();
  };

  const selectedCount = Object.values(selectedOptions).reduce(
    (count, set) => count + set.size,
    0
  );

  const FilterContent = () => (
    <div className="space-y-4 w-full">
      {filters.map((filter) => (
        <div key={filter.title} className="border rounded-lg shadow-sm bg-white">
          <button
            onClick={() => toggleDropdown(filter.title)}
            className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="font-medium text-gray-700">{filter.title}</span>
            {openDropdowns[filter.title] ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {openDropdowns[filter.title] && (
            <div className="px-4 pb-3 border-t">
              {filter.title === "Domain" ? (
                <DomainFilterOptions
                  filter={filter}
                  isSelected={isSelected}
                  toggleOption={toggleOption}
                />
              ) : filter.title === "Year of Submission" ? (
                <YearRangeFilterOptions />
              ) : (
                <div className="pt-2 space-y-2">
                  {filter.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected(filter.title, option)}
                        onChange={() => toggleOption(filter.title, option)}
                        className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none checked:bg-blue-500 checked:border-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 transition-colors"
      >
        <Filter className="w-5 h-5" />
        <span>Apply Filters {selectedCount > 0 && `(${selectedCount})`}</span>
      </button>

      <button
        onClick={clearFilters}
        className="w-full mt-2 px-4 py-3 bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center space-x-2 transition-colors"
      >
        <X className="w-5 h-5" />
        <span>Clear Filters</span>
      </button>
    </div>
  );

  // Domain filter options component with search functionality
  // Year Range Filter Component
  const YearRangeFilterOptions = () => {
    // Create a range of all possible years for the year picker
    const minPossibleYear = 2000;
    const maxPossibleYear = currentYear + 10;
    const allYears = Array.from(
      { length: maxPossibleYear - minPossibleYear + 1 },
      (_, i) => minPossibleYear + i
    );

    // State to control the year picker popup
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [activePickerType, setActivePickerType] = useState<'min' | 'max' | null>(null);
    
    // State for drag handling
    const [isDragging, setIsDragging] = useState(false);
    const [currentThumb, setCurrentThumb] = useState<'min' | 'max' | null>(null);
    
    // References to slider elements
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    
    // Effect to handle clicks outside the year picker
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
          setShowYearPicker(false);
        }
      }
      
      // Add event listener when the picker is shown
      if (showYearPicker) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      // Clean up
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showYearPicker]);

    // Function to handle mouse down on thumb elements
    const handleThumbMouseDown = (event: React.MouseEvent, thumbType: 'min' | 'max') => {
      // Prevent default and stop propagation
      event.preventDefault();
      event.stopPropagation();
      
      // Remove focus from any active element to prevent keyboard events
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Set dragging state immediately
      setCurrentThumb(thumbType);
      setIsDragging(true);
      
      // Add dragging styles and prevent text selection globally
      document.body.classList.add('slider-dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      // Capture the initial position
      const sliderRect = sliderRef.current?.getBoundingClientRect();
      if (sliderRect) {
        const position = (event.clientX - sliderRect.left) / sliderRect.width;
        const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
        if (thumbType === 'min') {
          setYearRangeFilter(prev => ({
            ...prev,
            min: Math.min(year, prev.max)
          }));
        } else {
          setYearRangeFilter(prev => ({
            ...prev,
            max: Math.max(year, prev.min)
          }));
        }
      }

      // Add the event listeners right away
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
    };
    
    // Function to handle touch events for mobile devices
    const handleThumbTouchStart = (event: React.TouchEvent, thumbType: 'min' | 'max') => {
      // Prevent default to avoid scrolling
      event.preventDefault();
      event.stopPropagation();
      
      // Set dragging state immediately
      setCurrentThumb(thumbType);
      setIsDragging(true);
      
      // Add dragging styles and prevent text selection globally
      document.body.classList.add('slider-dragging');
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
      
      // Capture the initial position
      const sliderRect = sliderRef.current?.getBoundingClientRect();
      if (sliderRect && event.touches[0]) {
        const position = (event.touches[0].clientX - sliderRect.left) / sliderRect.width;
        const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
        if (thumbType === 'min') {
          setYearRangeFilter(prev => ({
            ...prev,
            min: Math.min(year, prev.max)
          }));
        } else {
          setYearRangeFilter(prev => ({
            ...prev,
            max: Math.max(year, prev.min)
          }));
        }
      }

      // Add the event listeners right away
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      if (sliderRect && event.touches[0]) {
        const position = (event.touches[0].clientX - sliderRect.left) / sliderRect.width;
        const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
        setYearRangeFilter(prev => ({
          ...prev,
          [thumbType]: thumbType === 'min' ? Math.min(year, prev.max) : Math.max(year, prev.min)
        }));
      }
    };

    // Functions for handling drag movement and end
    const updateThumbPosition = (clientX: number) => {
      if (!sliderRef.current || !currentThumb) return;

      // Get slider dimensions
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const sliderWidth = sliderRect.width;
      const sliderLeft = sliderRect.left;
      
      // Calculate position as a percentage of the slider width
      let position = (clientX - sliderLeft) / sliderWidth;
      position = Math.min(1, Math.max(0, position)); // Clamp between 0 and 1
      
      // Convert position to year
      const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
      
      // Update the appropriate year based on which thumb is being dragged
      if (currentThumb === 'min') {
        setYearRangeFilter(prev => ({
          ...prev,
          min: Math.min(year, prev.max)
        }));
      } else {
        setYearRangeFilter(prev => ({
          ...prev,
          max: Math.max(year, prev.min)
        }));
      }
    };

    // Handler for mouse movement (defined outside useEffect for direct binding)
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      event.preventDefault();
      requestAnimationFrame(() => updateThumbPosition(event.clientX));
    };
    
    // Handler for touch movement
    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || !event.touches[0]) return;
      event.preventDefault();
      requestAnimationFrame(() => updateThumbPosition(event.touches[0].clientX));
    };
    
    // Handler for ending the drag
    const handleEnd = (event?: MouseEvent | TouchEvent) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      
      // Reset state and styles
      setIsDragging(false);
      setCurrentThumb(null);
      document.body.classList.remove('slider-dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.touchAction = '';
    };
    
    // Clean up event listeners on unmount
    useEffect(() => {
      return () => {
        if (isDragging) {
          handleEnd();
        }
      };
    }, []);
    
    // Function to handle direct clicks on the slider track
    const handleTrackClick = (event: React.MouseEvent) => {
      if (sliderRef.current) {
        // Get slider dimensions
        const sliderRect = sliderRef.current.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        const sliderLeft = sliderRect.left;
        
        // Calculate position as a percentage of the slider width
        let position = (event.clientX - sliderLeft) / sliderWidth;
        position = Math.min(1, Math.max(0, position)); // Clamp between 0 and 1
        
        // Convert position to year
        const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
        
        // Calculate current thumb positions as percentages
        const minPos = minThumbPosition / 100; // Convert percentage to decimal
        const maxPos = maxThumbPosition / 100;
        
        // Create a visual ripple effect at click position
        const clickEffect = document.createElement('div');
        clickEffect.className = 'absolute w-4 h-4 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping';
        clickEffect.style.left = `${event.clientX - sliderRect.left}px`;
        clickEffect.style.top = '50%';
        clickEffect.style.opacity = '0.6';
        clickEffect.style.pointerEvents = 'none';
        sliderRef.current.appendChild(clickEffect);
        
        // Remove the effect after animation
        setTimeout(() => {
          if (sliderRef.current && sliderRef.current.contains(clickEffect)) {
            sliderRef.current.removeChild(clickEffect);
          }
        }, 500);
        
        // Determine which thumb to move based on which side of the range the click is on
        let thumbType: 'min' | 'max' = 'min';
        
        if (position <= minPos) {
          // If click is to left of min thumb, move min thumb
          thumbType = 'min';
          setYearRangeFilter(prev => ({
            ...prev,
            min: year
          }));
        } else if (position >= maxPos) {
          // If click is to right of max thumb, move max thumb
          thumbType = 'max';
          setYearRangeFilter(prev => ({
            ...prev,
            max: year
          }));
        } else {
          // If click is inside range, move whichever thumb is closer
          const minDistance = Math.abs(position - minPos);
          const maxDistance = Math.abs(position - maxPos);
          
          if (minDistance <= maxDistance) {
            thumbType = 'min';
            setYearRangeFilter(prev => ({
              ...prev,
              min: year
            }));
          } else {
            thumbType = 'max';
            setYearRangeFilter(prev => ({
              ...prev,
              max: year
            }));
          }
        }
        
        // Animate the thumb that was moved
        setCurrentThumb(thumbType);
        setTimeout(() => {
          setCurrentThumb(null);
        }, 300);
      }
    };
    
    // Function to handle touch events on the slider track
    const handleTrackTouch = (event: React.TouchEvent) => {
      if (sliderRef.current && event.touches[0]) {
        // Prevent default to avoid scrolling while interacting
        event.preventDefault();
        
        // Get slider dimensions
        const sliderRect = sliderRef.current.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        const sliderLeft = sliderRect.left;
        
        // Calculate position as a percentage of the slider width
        let position = (event.touches[0].clientX - sliderLeft) / sliderWidth;
        position = Math.min(1, Math.max(0, position)); // Clamp between 0 and 1
        
        // Convert position to year
        const year = Math.round(minPossibleYear + position * (maxPossibleYear - minPossibleYear));
        
        // Use the same logic as the click handler
        const minPos = minThumbPosition / 100;
        const maxPos = maxThumbPosition / 100;
        
        if (position <= minPos) {
          setYearRangeFilter(prev => ({
            ...prev,
            min: year
          }));
        } else if (position >= maxPos) {
          setYearRangeFilter(prev => ({
            ...prev,
            max: year
          }));
        } else {
          const minDistance = Math.abs(position - minPos);
          const maxDistance = Math.abs(position - maxPos);
          
          if (minDistance <= maxDistance) {
            setYearRangeFilter(prev => ({
              ...prev,
              min: year
            }));
          } else {
            setYearRangeFilter(prev => ({
              ...prev,
              max: year
            }));
          }
        }
      }
    };

    // Function to toggle the year picker and set the active type
    const toggleYearPicker = (type: 'min' | 'max') => {
      setActivePickerType(type);
      setShowYearPicker(!showYearPicker && type === activePickerType ? false : true);
    };

    // Function to select a year
    const selectYear = (year: number) => {
      if (activePickerType === 'min') {
        // Update the min year
        setYearRangeFilter(prev => ({
          ...prev,
          min: Math.min(year, prev.max)
        }));
        
        // Automatically switch to max year picker
        // No delay needed as we're not closing the popup
        setActivePickerType('max');
      } else if (activePickerType === 'max') {
        setYearRangeFilter(prev => ({
          ...prev,
          max: Math.max(year, prev.min)
        }));
        setShowYearPicker(false);
      }
    };

    // Calculate the percentage for the range slider thumbs
    const minThumbPosition = ((yearRangeFilter.min - minPossibleYear) / (maxPossibleYear - minPossibleYear)) * 100;
    const maxThumbPosition = ((yearRangeFilter.max - minPossibleYear) / (maxPossibleYear - minPossibleYear)) * 100;

    return (
      <div className="pt-2 space-y-4 relative">
        {/* Year display with buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => toggleYearPicker('min')}
            className="flex-1 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-center"
          >
            {yearRangeFilter.min}
          </button>
          <span className="text-gray-500">to</span>
          <button
            onClick={() => toggleYearPicker('max')}
            className="flex-1 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-center"
          >
            {yearRangeFilter.max}
          </button>
        </div>

        {/* Range Slider */}
        <div className="mt-6 px-2">
          <div 
            ref={sliderRef}
            className="relative h-4 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleTrackClick}
            onTouchStart={handleTrackTouch}
            style={{ touchAction: 'none' }}
          >
            {/* Filled area between thumbs */}
            <div 
              className="absolute h-full bg-blue-500 rounded-full"
              style={{
                left: `${minThumbPosition}%`,
                width: `${maxThumbPosition - minThumbPosition}%`
              }}
            ></div>
            
            
            {/* Min thumb */}
            <div 
              className={`absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-1 transform -translate-x-1/2 select-none touch-none cursor-grab transition-all active:scale-110 ${
                currentThumb === 'min' && isDragging 
                  ? 'cursor-grabbing scale-110 z-30 border-blue-700 shadow-lg ring-4 ring-blue-100' 
                  : 'z-20 hover:shadow-md hover:scale-105 hover:border-blue-600'
              }`}
              style={{
                left: `${minThumbPosition}%`,
                touchAction: 'none', // Prevent browser handling touch events
                boxShadow: currentThumb === 'min' && isDragging ? '0 0 0 8px rgba(59, 130, 246, 0.2)' : ''
              }}
              onMouseDown={(e) => handleThumbMouseDown(e, 'min')}
              onTouchStart={(e) => handleThumbTouchStart(e, 'min')}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) {
                  toggleYearPicker('min');
                }
              }}
            >
              {/* Drag handle indicators */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex space-x-0.5">
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              
            </div>
            
            {/* Max thumb */}
            <div 
              className={`absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-1 transform -translate-x-1/2 select-none touch-none cursor-grab transition-all active:scale-110 ${
                currentThumb === 'max' && isDragging 
                  ? 'cursor-grabbing scale-110 z-30 border-blue-700 shadow-lg ring-4 ring-blue-100' 
                  : 'z-20 hover:shadow-md hover:scale-105 hover:border-blue-600'
              }`}
              style={{
                left: `${maxThumbPosition}%`,
                touchAction: 'none', // Prevent browser handling touch events
                boxShadow: currentThumb === 'max' && isDragging ? '0 0 0 8px rgba(59, 130, 246, 0.2)' : ''
              }}
              onMouseDown={(e) => handleThumbMouseDown(e, 'max')}
              onTouchStart={(e) => handleThumbTouchStart(e, 'max')}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) {
                  toggleYearPicker('max');
                }
              }}
            >
              {/* Drag handle indicators */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex space-x-0.5">
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-0.5 h-2.5 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Year labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{minPossibleYear}</span>
            <span>{maxPossibleYear}</span>
          </div>
        </div>

        {/* Year picker popup */}
        {showYearPicker && (
          <div 
            ref={yearPickerRef}
            className="absolute mt-1 bg-white border rounded-lg shadow-lg z-10 p-2 w-full max-h-60 overflow-y-auto"
          >
            <div className="grid grid-cols-3 gap-1">
              {allYears.map(year => (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  className={`py-1 px-2 text-sm rounded ${
                    (activePickerType === 'min' && year === yearRangeFilter.min) ||
                    (activePickerType === 'max' && year === yearRangeFilter.max)
                      ? 'bg-blue-500 text-white'
                      : year >= yearRangeFilter.min && year <= yearRangeFilter.max
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1 mt-4">
          <div className="text-xs text-gray-500 text-center">
            Projects from {yearRangeFilter.min} to {yearRangeFilter.max} will be shown
          </div>
          <div className="text-xs text-blue-500 text-center flex items-center justify-center">
          </div>
        </div>
      </div>
    );
  };

  const DomainFilterOptions = ({
    filter,
    isSelected,
    toggleOption
  }: {
    filter: FilterOption;
    isSelected: (filterTitle: string, option: string) => boolean;
    toggleOption: (filterTitle: string, option: string) => void;
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredOptions = filter.options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="pt-2 space-y-2">
        <input
          type="text"
          placeholder="Search Domain..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <label
              key={option}
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={isSelected(filter.title, option)}
                onChange={() => toggleOption(filter.title, option)}
                className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none checked:bg-blue-500 checked:border-blue-500"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))
        ) : (
          <div className="text-sm text-gray-500">No options found.</div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block p-4 space-y-4 w-64 bg-white">
        <FilterContent />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Filter className="w-6 h-6 md:mr-2 animate-pulse group-hover:animate-none" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute inset-0 bg-white flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-black">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="text-black w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
