"use client";

import { useState } from "react";
import ProjectManager from "../../components/ProjectManager";

// 실제 데이터 타입 정의 (실사용 기준, id와 기타 필드 포함)
type Project = {
  id?: string;
  title: string;
  description: string;
  author: string;
};

type Paper = {
  id?: string;
  title: string;
};

type Note = {
  id?: string;
  content: string;
};

export default function ProjectPage() {
  // 상태 정의
  const [projects, setProjects] = useState<Project[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    title: "",
    description: "",
    author: "sungkwon",
  });

  // 실질적으로 ProjectManager에 넘기는 props를 타입 정확히 맞춰줌
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
  );
}
