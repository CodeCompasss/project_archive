import { useState } from "react";
import { CalendarDays, WalletCards, Users, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Project } from "@/types/project";

interface TeamMember {
  member_id: number;
  project_id: number;
  name: string;
  linkedin: string;
}

interface ProjectWithMembers extends Project {
  teamMembers?: TeamMember[];
}

interface ProjectCardProps {
  project: ProjectWithMembers;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Get team members from the project data
  const members = project.teamMembers || [];

  // Debug: Log the project data to see what's being passed
  console.log('Project data:', project);
  console.log('Team members:', members);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform ${expanded ? "scale-105" : "hover:-translate-y-1"}`}
    >
      <div className="md:flex">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 md:w-1/3">
          <h2 
            className="text-white text-xl font-semibold mb-2 cursor-pointer"
            onClick={toggleExpand}
          >
            {project.projectName}
          </h2>
          
          {!expanded && (
            <p 
              className="text-gray-200 text-sm cursor-pointer"
              onClick={toggleExpand}
            >
              {(project.projectDescription).slice(0, 100) + "..."}
            </p>
          )}
          
          {expanded && members && members.length > 0 && (
            <div className="mt-4">
              <h3 className="text-white text-sm font-medium mb-2">Team Members:</h3>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => (
                  <div key={member.member_id} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <span>{member.name}</span>
                    {member.linkedin && (
                      <Link 
                        href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()} // Prevent card expansion when clicking LinkedIn
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
                          <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
                        </svg>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {expanded && (!members || members.length === 0) && (
            <div className="mt-4">
              <p className="text-gray-200 text-sm">No team members listed</p>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4 md:w-2/3 md:flex md:flex-col md:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 group">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-500 text-xs">Year</p>
                <p className="text-gray-800 font-medium">
                  {project.yearOfSubmission}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <WalletCards className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-500 text-xs">Project Type</p>
                <p className="text-gray-800 font-medium">
                  {project.projectType}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-500 text-xs">Domain</p>
                <p className="text-gray-800 font-medium">
                  {project.customDomain || project.domain}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-start">
            <Link
              href={project.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent card expansion when clicking link
            >
              <LinkIcon className="w-4 h-4 group-hover:animate-bounce" />
              <span>View Project</span>
            </Link>
          </div>
          
          {expanded && (
            <div className="mt-4">
              <p className="text-gray-800 text-sm">
                {project.projectDescription}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button 
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" 
              onClick={toggleExpand}
            >
              {expanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
            
            {!expanded && members && members.length > 0 && (
              <div className="flex items-center text-gray-500 text-sm">
                <Users className="w-4 h-4 mr-1" />
                <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}