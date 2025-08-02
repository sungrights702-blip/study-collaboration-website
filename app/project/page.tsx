"use client"

import ProjectManager from "@/components/ProjectManager"
import { useState } from "react"

export default function ProjectPage() {
  const [projects, setProjects] = useState([])
  const [papers, setPapers] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    author: "sungkwon",
  })

  return (
    <ProjectManager
      projects={projects}
      papers={papers}
      notes={notes}
      selectedProject={selectedProject}
      onProjectSelect={setSelectedProject}
      onProjectsUpdate={setProjects}
      newProject={newProject}
      onNewProjectUpdate={setNewProject}
    />
  )
}
