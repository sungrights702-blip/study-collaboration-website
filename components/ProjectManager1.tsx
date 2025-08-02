"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Target, FileText, X, GitBranch, Lightbulb, BookOpen, Link, Edit, Save } from "lucide-react"

interface Paper {
  id: string
  title: string
  authors: string
  year?: number
  summary: string
  tags: string[]
  fieldId: string
  subFieldId?: string
  date: string
  uploadedBy: "sungkwon" | "jimin"
  personalStatus: {
    sungkwon: "reading" | "completed" | "todo"
    jimin: "reading" | "completed" | "todo"
  }
}

interface Note {
  id: string
  title: string
  content: string
  author: "sungkwon" | "jimin"
  date: string
  tags: string[]
  files: any[]
}

interface ProjectNode {
  id: string
  title: string
  description: string
  x: number
  y: number
  type: "main" | "argument" | "paper" | "note"
  parentId?: string
  paperId?: string
  noteId?: string
  color: string
}

interface Project {
  id: string
  title: string
  description: string
  author: "sungkwon" | "jimin"
  date: string
  nodes: ProjectNode[]
  connections: { from: string; to: string }[]
}

interface ProjectManagerProps {
  projects: Project[]
  papers: Paper[]
  notes: Note[]
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
  onProjectsUpdate: (projects: Project[]) => void
  newProject: {
    title: string
    description: string
    author: "sungkwon" | "jimin"
  }
  onNewProjectUpdate: (project: any) => void
}

export default function ProjectManager({
  projects,
  papers,
  notes,
  selectedProject,
  onProjectSelect,
  onProjectsUpdate,
  newProject,
  onNewProjectUpdate,
}: ProjectManagerProps) {
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [showAddNode, setShowAddNode] = useState(false)
  const [showPaperSelector, setShowPaperSelector] = useState(false)
  const [showNoteSelector, setShowNoteSelector] = useState(false)
  const [connectionMode, setConnectionMode] = useState(false)
  const [connectionStart, setConnectionStart] = useState<string | null>(null)
  const [newNodeData, setNewNodeData] = useState({
    title: "",
    description: "",
    type: "argument" as "main" | "argument" | "paper" | "note",
    parentId: "",
  })
  const [editNodeData, setEditNodeData] = useState({
    title: "",
    description: "",
  })

  const svgRef = useRef<SVGSVGElement>(null)

  const colors = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-red-500 to-red-600",
    "from-yellow-500 to-yellow-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-teal-500 to-teal-600",
  ]

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const project: Project = {
        id: Date.now().toString(),
        title: newProject.title,
        description: newProject.description,
        author: newProject.author,
        date: new Date().toISOString().split("T")[0],
        nodes: [
          {
            id: "main-" + Date.now(),
            title: newProject.title,
            description: newProject.description,
            x: 400,
            y: 200,
            type: "main",
            color: "from-amber-500 to-amber-600",
          },
        ],
        connections: [],
      }
      onProjectsUpdate([...projects, project])
      onNewProjectUpdate({ title: "", description: "", author: "sungkwon" })
      onProjectSelect(project.id)
    }
  }

  const addNode = () => {
    if (!selectedProject || !newNodeData.title) return

    const project = projects.find((p) => p.id === selectedProject)
    if (!project) return

    const newNode: ProjectNode = {
      id: Date.now().toString(),
      title: newNodeData.title,
      description: newNodeData.description,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      type: newNodeData.type,
      parentId: newNodeData.parentId || undefined,
      color: colors[Math.floor(Math.random() * colors.length)],
    }

    const updatedProject = {
      ...project,
      nodes: [...project.nodes, newNode],
      connections: newNodeData.parentId
        ? [...project.connections, { from: newNodeData.parentId, to: newNode.id }]
        : project.connections,
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
    setNewNodeData({ title: "", description: "", type: "argument", parentId: "" })
    setShowAddNode(false)
  }

  const addPaperNode = (paperId: string) => {
    if (!selectedProject) return

    const project = projects.find((p) => p.id === selectedProject)
    const paper = papers.find((p) => p.id === paperId)
    if (!project || !paper) return

    const newNode: ProjectNode = {
      id: Date.now().toString(),
      title: paper.title,
      description: paper.summary,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      type: "paper",
      paperId: paperId,
      color: "from-emerald-500 to-emerald-600",
    }

    const updatedProject = {
      ...project,
      nodes: [...project.nodes, newNode],
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
    setShowPaperSelector(false)
  }

  const addNoteNode = (noteId: string) => {
    if (!selectedProject) return

    const project = projects.find((p) => p.id === selectedProject)
    const note = notes.find((n) => n.id === noteId)
    if (!project || !note) return

    const newNode: ProjectNode = {
      id: Date.now().toString(),
      title: note.title,
      description: note.content.substring(0, 100) + "...",
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      type: "note",
      noteId: noteId,
      color: "from-orange-500 to-orange-600",
    }

    const updatedProject = {
      ...project,
      nodes: [...project.nodes, newNode],
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
    setShowNoteSelector(false)
  }

  const startEditingNode = (nodeId: string) => {
    const project = projects.find((p) => p.id === selectedProject)
    const node = project?.nodes.find((n) => n.id === nodeId)
    if (node) {
      setEditNodeData({
        title: node.title,
        description: node.description,
      })
      setEditingNodeId(nodeId)
    }
  }

  const saveEditingNode = () => {
    if (!selectedProject || !editingNodeId) return

    const project = projects.find((p) => p.id === selectedProject)
    if (!project) return

    const updatedProject = {
      ...project,
      nodes: project.nodes.map((node) =>
        node.id === editingNodeId
          ? { ...node, title: editNodeData.title, description: editNodeData.description }
          : node,
      ),
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
    setEditingNodeId(null)
    setEditNodeData({ title: "", description: "" })
  }

  const cancelEditingNode = () => {
    setEditingNodeId(null)
    setEditNodeData({ title: "", description: "" })
  }

  const handleNodeClick = (nodeId: string) => {
    if (connectionMode) {
      if (!connectionStart) {
        setConnectionStart(nodeId)
      } else if (connectionStart !== nodeId) {
        // 연결선 생성
        const project = projects.find((p) => p.id === selectedProject)
        if (project) {
          const updatedProject = {
            ...project,
            connections: [...project.connections, { from: connectionStart, to: nodeId }],
          }
          onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
        }
        setConnectionStart(null)
        setConnectionMode(false)
      }
    }
  }

  const deleteConnection = (from: string, to: string) => {
    if (!selectedProject) return

    const project = projects.find((p) => p.id === selectedProject)
    if (!project) return

    const updatedProject = {
      ...project,
      connections: project.connections.filter((conn) => !(conn.from === from && conn.to === to)),
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
  }

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (connectionMode) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const node = projects.find((p) => p.id === selectedProject)?.nodes.find((n) => n.id === nodeId)
    if (!node) return

    setDraggedNode(nodeId)
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode || !selectedProject || connectionMode) return

      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const newX = e.clientX - rect.left - dragOffset.x
      const newY = e.clientY - rect.top - dragOffset.y

      const project = projects.find((p) => p.id === selectedProject)
      if (!project) return

      const updatedProject = {
        ...project,
        nodes: project.nodes.map((node) =>
          node.id === draggedNode ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) } : node,
        ),
      }

      onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
    },
    [draggedNode, selectedProject, dragOffset, projects, onProjectsUpdate, connectionMode],
  )

  const handleMouseUp = () => {
    setDraggedNode(null)
  }

  const deleteNode = (nodeId: string) => {
    if (!selectedProject) return

    const project = projects.find((p) => p.id === selectedProject)
    if (!project) return

    const updatedProject = {
      ...project,
      nodes: project.nodes.filter((node) => node.id !== nodeId),
      connections: project.connections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId),
    }

    onProjectsUpdate(projects.map((p) => (p.id === selectedProject ? updatedProject : p)))
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "main":
        return <Target className="h-4 w-4 text-white mx-auto" />
      case "argument":
        return <Lightbulb className="h-4 w-4 text-white mx-auto" />
      case "paper":
        return <FileText className="h-4 w-4 text-white mx-auto" />
      case "note":
        return <BookOpen className="h-4 w-4 text-white mx-auto" />
      default:
        return <Target className="h-4 w-4 text-white mx-auto" />
    }
  }

  const currentProject = projects.find((p) => p.id === selectedProject)

  return (
    <div className="space-y-8">
      {/* 프로젝트 생성 */}
      <Card className="luxury-card border-0 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-600/10 to-indigo-700/10 rounded-t-2xl">
          <CardTitle className="text-4xl font-serif font-bold flex items-center gap-4">
            <Target className="h-10 w-10 text-purple-600" />새 프로젝트 생성
          </CardTitle>
          <CardDescription className="text-xl font-body">
            연구 주제별로 논문과 아이디어를 체계적으로 정리하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="p-12 space-y-10">
          <div>
            <Label htmlFor="project-title" className="text-xl font-serif font-semibold">
              프로젝트 제목
            </Label>
            <Input
              id="project-title"
              value={newProject.title}
              onChange={(e) => onNewProjectUpdate({ ...newProject, title: e.target.value })}
              placeholder="예: AI 윤리 연구 프로젝트"
              className="h-16 mt-4 text-lg font-body rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="project-description" className="text-xl font-serif font-semibold">
              프로젝트 설명
            </Label>
            <Textarea
              id="project-description"
              value={newProject.description}
              onChange={(e) => onNewProjectUpdate({ ...newProject, description: e.target.value })}
              placeholder="프로젝트의 목표와 주요 내용을 설명해주세요"
              rows={5}
              className="mt-4 text-lg font-body rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="project-author" className="text-xl font-serif font-semibold">
              프로젝트 리더
            </Label>
            <select
              id="project-author"
              value={newProject.author}
              onChange={(e) => onNewProjectUpdate({ ...newProject, author: e.target.value as "sungkwon" | "jimin" })}
              className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body"
            >
              <option value="sungkwon">성권</option>
              <option value="jimin">지민</option>
            </select>
          </div>
          <Button
            onClick={addProject}
            className="w-full h-18 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-serif font-bold text-xl shadow-2xl rounded-2xl"
          >
            <Plus className="h-7 w-7 mr-4" />
            프로젝트 생성
          </Button>
        </CardContent>
      </Card>

      {/* 프로젝트 목록 */}
      <Card className="luxury-card border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-serif font-bold flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-purple-600" />
            프로젝트 목록
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Target className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-bold text-gray-600 mb-4">아직 프로젝트가 없습니다</h3>
              <p className="text-lg text-gray-500 font-body">첫 번째 프로젝트를 생성해보세요!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedProject === project.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => onProjectSelect(project.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">{project.title}</h3>
                        <p className="text-gray-600 font-body mb-4">{project.description}</p>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {project.author === "sungkwon" ? "성권" : "지민"}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50">
                            {project.nodes.length}개 노드
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50">
                            {project.connections.length}개 연결
                          </Badge>
                          <span className="text-gray-500 font-body">{project.date}</span>
                        </div>
                      </div>
                      {selectedProject === project.id && <Badge className="bg-purple-500 text-white">선택됨</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 마인드맵 에디터 */}
      {currentProject && (
        <Card className="luxury-card border-0 rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-serif font-bold flex items-center gap-4">
                  <GitBranch className="h-8 w-8 text-purple-600" />
                  {currentProject.title} - 마인드맵
                </CardTitle>
                <CardDescription className="text-xl font-body">
                  노드를 드래그하여 이동하고, 논문과 아이디어를 연결해보세요
                </CardDescription>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => {
                    setConnectionMode(!connectionMode)
                    setConnectionStart(null)
                  }}
                  className={`font-serif font-semibold ${
                    connectionMode
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white"
                  }`}
                >
                  <Link className="h-5 w-5 mr-2" />
                  {connectionMode ? "연결 모드 종료" : "연결선 그리기"}
                </Button>

                <Dialog open={showAddNode} onOpenChange={setShowAddNode}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-serif font-semibold">
                      <Plus className="h-5 w-5 mr-2" />
                      주장 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 주장 노드 추가</DialogTitle>
                      <DialogDescription>프로젝트에 새로운 주장이나 아이디어를 추가하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>제목</Label>
                        <Input
                          value={newNodeData.title}
                          onChange={(e) => setNewNodeData({ ...newNodeData, title: e.target.value })}
                          placeholder="주장의 제목을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label>설명</Label>
                        <Textarea
                          value={newNodeData.description}
                          onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                          placeholder="주장에 대한 자세한 설명을 입력하세요"
                          rows={3}
                        />
                      </div>
                      <Button onClick={addNode} className="w-full">
                        추가
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showPaperSelector} onOpenChange={setShowPaperSelector}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 font-serif font-semibold bg-transparent"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      논문 연결
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>논문 선택</DialogTitle>
                      <DialogDescription>프로젝트에 연결할 논문을 선택하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {papers.map((paper) => (
                        <Card
                          key={paper.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-emerald-300"
                          onClick={() => addPaperNode(paper.id)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-serif font-bold text-lg mb-2">{paper.title}</h3>
                            <p className="text-gray-600 font-body mb-2">{paper.authors}</p>
                            <p className="text-gray-700 font-body text-sm">{paper.summary.substring(0, 150)}...</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showNoteSelector} onOpenChange={setShowNoteSelector}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50 font-serif font-semibold bg-transparent"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      노트 연결
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>아이디어 노트 선택</DialogTitle>
                      <DialogDescription>프로젝트에 연결할 아이디어 노트를 선택하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <Card
                          key={note.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-300"
                          onClick={() => addNoteNode(note.id)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-serif font-bold text-lg mb-2 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-orange-600" />
                              {note.title}
                            </h3>
                            <p className="text-gray-600 font-body mb-2">
                              작성자: {note.author === "sungkwon" ? "성권" : "지민"} • {note.date}
                            </p>
                            <p className="text-gray-700 font-body text-sm">{note.content.substring(0, 150)}...</p>
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {connectionMode && (
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Link className="h-6 w-6 text-indigo-600" />
                  <div>
                    <p className="font-serif font-semibold text-indigo-800">연결선 그리기 모드</p>
                    <p className="text-sm text-indigo-600 font-body">
                      {connectionStart ? "연결할 대상 노드를 클릭하세요" : "연결을 시작할 노드를 클릭하세요"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-2 border-gray-200 rounded-2xl bg-gray-50 relative overflow-hidden">
              <svg
                ref={svgRef}
                width="100%"
                height="600"
                className={connectionMode ? "cursor-crosshair" : "cursor-move"}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 연결선 그리기 */}
                {currentProject.connections.map((connection, index) => {
                  const fromNode = currentProject.nodes.find((n) => n.id === connection.from)
                  const toNode = currentProject.nodes.find((n) => n.id === connection.to)
                  if (!fromNode || !toNode) return null

                  return (
                    <g key={index}>
                      <line
                        x1={fromNode.x + 100}
                        y1={fromNode.y + 40}
                        x2={toNode.x + 100}
                        y2={toNode.y + 40}
                        stroke="#9333ea"
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        className="hover:stroke-red-500 cursor-pointer"
                        onClick={() => deleteConnection(connection.from, connection.to)}
                      />
                      {/* 연결선 중간에 삭제 버튼 */}
                      <circle
                        cx={(fromNode.x + toNode.x) / 2 + 100}
                        cy={(fromNode.y + toNode.y) / 2 + 40}
                        r="8"
                        fill="white"
                        stroke="#9333ea"
                        strokeWidth="2"
                        className="hover:fill-red-100 cursor-pointer"
                        onClick={() => deleteConnection(connection.from, connection.to)}
                      />
                      <text
                        x={(fromNode.x + toNode.x) / 2 + 100}
                        y={(fromNode.y + toNode.y) / 2 + 40}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-red-500 cursor-pointer pointer-events-none"
                      >
                        ×
                      </text>
                    </g>
                  )
                })}

                {/* 노드 렌더링 */}
                {currentProject.nodes.map((node) => (
                  <g key={node.id}>
                    <foreignObject x={node.x} y={node.y} width="200" height="80">
                      <div
                        className={`w-full h-full bg-gradient-to-r ${node.color} rounded-xl shadow-lg flex items-center justify-center relative group transition-all duration-200 ${
                          connectionMode ? "cursor-crosshair hover:scale-105" : "cursor-move hover:scale-105"
                        } ${connectionStart === node.id ? "ring-4 ring-indigo-400 ring-opacity-75" : ""}`}
                        onMouseDown={(e) => handleMouseDown(e, node.id)}
                        onClick={() => handleNodeClick(node.id)}
                      >
                        <div className="text-center p-3">
                          <div className="text-white font-serif font-bold text-sm mb-1 truncate">{node.title}</div>
                          {getNodeIcon(node.type)}
                        </div>

                        {/* 노드 액션 버튼들 */}
                        {!connectionMode && node.type !== "main" && (
                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingNode(node.id)
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNode(node.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-500 font-body">
                💡 팁: 노드를 드래그하여 위치를 조정하고, "연결선 그리기" 버튼으로 노드 간 관계를 설정하세요
              </p>
              {connectionMode && (
                <p className="text-indigo-600 font-body font-semibold">
                  🔗 연결 모드: 두 노드를 순서대로 클릭하여 연결선을 그으세요
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 노드 편집 다이얼로그 */}
      <Dialog open={editingNodeId !== null} onOpenChange={() => setEditingNodeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>노드 편집</DialogTitle>
            <DialogDescription>노드의 제목과 설명을 수정할 수 있습니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>제목</Label>
              <Input
                value={editNodeData.title}
                onChange={(e) => setEditNodeData({ ...editNodeData, title: e.target.value })}
                placeholder="노드 제목을 입력하세요"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea
                value={editNodeData.description}
                onChange={(e) => setEditNodeData({ ...editNodeData, description: e.target.value })}
                placeholder="노드 설명을 입력하세요"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveEditingNode} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                저장
              </Button>
              <Button variant="outline" onClick={cancelEditingNode} className="flex-1 bg-transparent">
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
