"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, XCircle } from "lucide-react";
import Link from "next/link";
import { onAuthStateChanged } from '@/lib/firebase/auth';
import { createUserIfNotExist } from '@/server-action/auth_action';

interface AddProjectFormProps {
  initialSubmissionYears: number[];
  initialProjectTypes: string[];
  initialDepartments: string[];
  initialAvailableDomains: string[];
}

export default function AddProjectForm({
  initialSubmissionYears,
  initialProjectTypes,
  initialDepartments,
  initialAvailableDomains,
}: AddProjectFormProps) {

  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    yearOfSubmission: initialSubmissionYears[0] ? String(initialSubmissionYears[0]) : "",
    projectType: initialProjectTypes[0] || "",
    department: initialDepartments[0] || "",
    domain: initialAvailableDomains[0] || "",
    customDomain: "",
    projectLink: "",
    members: [{ name: "", linkedin: "" }]
  });

  // Update initialFormState after client component mounts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      yearOfSubmission: initialSubmissionYears[0] ? String(initialSubmissionYears[0]) : "",
      projectType: initialProjectTypes[0] || "",
      department: initialDepartments[0] || "",
      domain: initialAvailableDomains[0] || "",
    }));
  }, [initialSubmissionYears, initialProjectTypes, initialDepartments, initialAvailableDomains]);

  const [showPopup, setShowPopup] = useState(false); // State for pop-up visibility
  const [loading, setLoading] = useState(false); // Loading state to prevent duplicate submissions
  const [userId, setUserId] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      if (authUser && authUser.email && authUser.displayName) {
        // Ensure user exists in our PostgreSQL database
        const numericUserId = await createUserIfNotExist(authUser.email, authUser.displayName);
        setUserId(numericUserId);
      } else {
        console.error("Firebase user not found or missing email/displayName.");
        setUserId(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading || userId === null) {
      console.log("Submission prevented:", { loading, authLoading, userId });
      return;
    }

    // Ensure at least one member has a name
    const hasValidMember = formData.members.some(
      (member) => member.name.trim() !== ""
    );
    if (!hasValidMember) {
      alert("Please enter at least one member name.");
      return;
    }

    setLoading(true);

    // Filter out empty members
    const filteredMembers = formData.members.filter(
      (member) => member.name.trim() !== ""
    );

    const projectData = {
      ...formData,
      members: filteredMembers,
      userId: userId
    };
    console.log("Sending project data with userId:", projectData.userId);

    try {
      const response = await fetch("/api/saveProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({
          projectName: "",
          projectDescription: "",
          yearOfSubmission: initialSubmissionYears[0] ? String(initialSubmissionYears[0]) : "",
          projectType: initialProjectTypes[0] || "",
          department: initialDepartments[0] || "",
          domain: initialAvailableDomains[0] || "",
          customDomain: "",
          projectLink: "",
          members: [{ name: "", linkedin: "" }]
        });
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        alert(result.error || "Failed to save project.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.members];
    updatedMembers[index][field as keyof typeof updatedMembers[0]] = value;
    setFormData({ ...formData, members: updatedMembers });
  };

  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: "", linkedin: "" }]
    });
  };

  const removeMember = (index: number) => {
    const updatedMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: updatedMembers });
  };

  const clearForm = () => {
    setFormData({
      projectName: "",
      projectDescription: "",
      yearOfSubmission: initialSubmissionYears[0] ? String(initialSubmissionYears[0]) : "",
      projectType: initialProjectTypes[0] || "",
      department: initialDepartments[0] || "",
      domain: initialAvailableDomains[0] || "",
      customDomain: "",
      projectLink: "",
      members: [{ name: "", linkedin: "" }]
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Project</h1>
        </div>
      </div>

      {/* Pop-up Message */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            fontSize: "20px",
            fontWeight: "bold",
            animation: "popIn 0.6s ease-in-out"
          }}
        >
          🎉 Congratulations! Your project was saved successfully! 🎉
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          <input
            type="text"
            name="projectName"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Project Name"
            onChange={handleChange}
            value={formData.projectName}
          />
          <textarea
            name="projectDescription"
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Project Description"
            onChange={handleChange}
            value={formData.projectDescription}
          />
          <select
            name="yearOfSubmission"
            required
            className="w-full px-4 py-2 border rounded-lg"
            onChange={handleChange}
            value={formData.yearOfSubmission}
          >
            {initialSubmissionYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            name="projectType"
            required
            className="w-full px-4 py-2 border rounded-lg"
            onChange={handleChange}
            value={formData.projectType}
          >
            {initialProjectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            name="department"
            required
            className="w-full px-4 py-2 border rounded-lg"
            onChange={handleChange}
            value={formData.department}
          >
            {initialDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            name="domain"
            required
            className="w-full px-4 py-2 border rounded-lg"
            onChange={handleChange}
            value={formData.domain}
          >
            {initialAvailableDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          {formData.domain === "Other" && (
            <input
              type="text"
              name="customDomain"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter custom domain"
              onChange={handleChange}
              value={formData.customDomain}
            />
          )}
          <input
            type="url"
            name="projectLink"
            required
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Github link or google drive link of project contents"
            onChange={handleChange}
            value={formData.projectLink}
          />

          {/* Members Section */}
          {formData.members.map((member, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                className="px-4 py-2 border rounded-lg w-1/2"
                placeholder="Member Name"
                value={member.name}
                onChange={(e) =>
                  handleMemberChange(index, "name", e.target.value)
                }
              />
              <input
                type="url"
                className="px-4 py-2 border rounded-lg w-1/2"
                placeholder="LinkedIn Profile"
                value={member.linkedin}
                onChange={(e) =>
                  handleMemberChange(index, "linkedin", e.target.value)
                }
                disabled={!member.name.trim()}
              />
              {formData.members.length > 1 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeMember(index)}
                >
                  <XCircle className="h-6 w-6" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="w-full bg-gray-200 px-4 py-2 rounded-lg"
            onClick={addMember}
          >
            Add Member
          </button>

          <div className="flex gap-4">
            <button
              type="submit"
              className={`flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center ${
                loading ||
                formData.members.every((m) => m.name.trim() === "")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={
                loading || formData.members.every((m) => m.name.trim() === "")
              }
            >
              {loading ? (
                <>
                  <Save className="h-5 w-5 mr-2 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  <span>Save Project</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center justify-center"
              onClick={clearForm}
            >
              <XCircle className="h-5 w-5 mr-2" />
              <span>Clear</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 