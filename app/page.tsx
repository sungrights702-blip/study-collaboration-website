"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import ProjectManager from "../components/project-manager"
import {
  FileText,
  CheckSquare,
  Users,
  Plus,
  Trash2,
  Search,
  Crown,
  CalendarIcon,
  Target,
  Upload,
  File,
  Download,
  Lightbulb,
  BookOpen,
  Settings,
  X,
  Clock,
  ChevronDown,
  ChevronRight,
  Camera,
  Edit,
  Save,
  ArrowLeft,
  ImageIcon,
  Paperclip,
} from "lucide-react"

interface SubField {
  id: string
  name: string
  parentId: string
}

interface Field {
  id: string
  name: string
  color: string
  subFields: SubField[]
}

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
  file?: {
    name: string
    size: number
    url: string
  }
  personalStatus: {
    sungkwon: "reading" | "completed" | "todo"
    jimin: "reading" | "completed" | "todo"
  }
}

interface Schedule {
  id: string
  title: string
  description: string
  assignee: "sungkwon" | "jimin" | "both"
  priority: "high" | "medium" | "low"
  completed: boolean
  dueDate: string
  startTime?: string
  endTime?: string
}

interface NoteFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface Note {
  id: string
  title: string
  content: string
  author: "sungkwon" | "jimin"
  date: string
  tags: string[]
  files: NoteFile[]
}

interface UserProfile {
  sungkwon: {
    name: string
    avatar?: string
  }
  jimin: {
    name: string
    avatar?: string
  }
}

interface ProjectNode {
  id: string
  title: string
  description: string
  x: number
  y: number
  type: "main" | "argument" | "paper"
  parentId?: string
  paperId?: string
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

export default function RepublicOfSungji() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [showFieldManager, setShowFieldManager] = useState(false)
  const [newFieldName, setNewFieldName] = useState("")
  const [newSubFieldName, setNewSubFieldName] = useState("")
  const [selectedFieldForSubField, setSelectedFieldForSubField] = useState("")
  const [expandedFields, setExpandedFields] = useState<string[]>([])

  // 편집 상태 관리
  const [editingPaper, setEditingPaper] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)

  // 프로젝트 관련 상태
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const [userProfiles, setUserProfiles] = useState<UserProfile>({
    sungkwon: { name: "성권" },
    jimin: { name: "지민" },
  })

  const [fields, setFields] = useState<Field[]>([
    {
      id: "1",
      name: "인공지능",
      color: "from-amber-600 to-yellow-700",
      subFields: [
        { id: "1-1", name: "머신러닝", parentId: "1" },
        { id: "1-2", name: "딥러닝", parentId: "1" },
        { id: "1-3", name: "강화학습", parentId: "1" },
      ],
    },
    {
      id: "2",
      name: "데이터사이언스",
      color: "from-emerald-600 to-teal-700",
      subFields: [
        { id: "2-1", name: "데이터분석", parentId: "2" },
        { id: "2-2", name: "통계학", parentId: "2" },
      ],
    },
    {
      id: "3",
      name: "컴퓨터비전",
      color: "from-blue-600 to-indigo-700",
      subFields: [
        { id: "3-1", name: "이미지처리", parentId: "3" },
        { id: "3-2", name: "객체인식", parentId: "3" },
      ],
    },
    {
      id: "4",
      name: "자연어처리",
      color: "from-rose-600 to-pink-700",
      subFields: [
        { id: "4-1", name: "텍스트마이닝", parentId: "4" },
        { id: "4-2", name: "언어모델", parentId: "4" },
      ],
    },
  ])

  const [papers, setPapers] = useState<Paper[]>([
    {
      id: "1",
      title: "Deep Learning for Natural Language Processing",
      authors: "Smith, J. et al.",
      year: 2023,
      summary:
        "이 논문은 자연어 처리에서 딥러닝의 최신 기법들을 다룹니다. Transformer 아키텍처와 BERT 모델의 성능 향상에 대해 분석합니다.",
      tags: ["NLP", "Deep Learning", "Transformer"],
      fieldId: "4",
      subFieldId: "4-2",
      date: "2024-01-15",
      uploadedBy: "sungkwon",
      personalStatus: {
        sungkwon: "reading",
        jimin: "todo",
      },
    },
    {
      id: "2",
      title: "Computer Vision Applications in Healthcare",
      authors: "Johnson, A. & Lee, K.",
      year: 2024,
      summary: "의료 분야에서 컴퓨터 비전 기술의 활용 사례를 소개하고, 진단 정확도 향상에 대한 연구 결과를 제시합니다.",
      tags: ["Computer Vision", "Healthcare", "AI"],
      fieldId: "3",
      subFieldId: "3-2",
      date: "2024-01-10",
      uploadedBy: "jimin",
      personalStatus: {
        sungkwon: "todo",
        jimin: "completed",
      },
    },
  ])

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "1",
      title: "논문 3편 요약 정리",
      description: "이번 주까지 선정한 논문 3편의 핵심 내용 정리",
      assignee: "both",
      priority: "high",
      completed: false,
      dueDate: "2024-01-20",
      startTime: "09:00",
      endTime: "12:00",
    },
    {
      id: "2",
      title: "연구 방법론 스터디",
      description: "질적 연구 방법론 챕터 1-3 읽기",
      assignee: "sungkwon",
      priority: "medium",
      completed: true,
      dueDate: "2024-01-18",
      startTime: "14:00",
      endTime: "16:00",
    },
  ])

  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "AI 윤리 연구 아이디어",
      content:
        "AI 시스템의 편향성 문제를 해결하기 위한 새로운 접근법에 대한 아이디어입니다. 특히 의료 AI에서의 공정성 확보 방안을 중점적으로 연구해보면 좋을 것 같습니다.",
      author: "sungkwon",
      date: "2024-01-15",
      tags: ["AI윤리", "아이디어"],
      files: [],
    },
  ])

  const [newPaper, setNewPaper] = useState({
    title: "",
    authors: "",
    year: "",
    summary: "",
    tags: "",
    fieldId: "",
    subFieldId: "",
    file: null as File | null,
  })

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    assignee: "sungkwon" as "sungkwon" | "jimin" | "both",
    priority: "medium" as "high" | "medium" | "low",
    dueDate: "",
    startTime: "",
    endTime: "",
  })

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    author: "sungkwon" as "sungkwon" | "jimin",
    files: [] as File[],
  })

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    author: "sungkwon" as "sungkwon" | "jimin",
  })

  // Profile image upload
  const handleProfileImageUpload = (person: "sungkwon" | "jimin", file: File) => {
    const imageUrl = URL.createObjectURL(file)
    setUserProfiles((prev) => ({
      ...prev,
      [person]: {
        ...prev[person],
        avatar: imageUrl,
      },
    }))
  }

  // Note file upload
  const handleNoteFileUpload = (files: FileList) => {
    const newFiles = Array.from(files)
    setNewNote((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }))
  }

  const removeNoteFile = (index: number) => {
    setNewNote((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  // Field management with sub-fields
  const addField = () => {
    if (newFieldName.trim()) {
      const colors = [
        "from-amber-600 to-yellow-700",
        "from-emerald-600 to-teal-700",
        "from-blue-600 to-indigo-700",
        "from-rose-600 to-pink-700",
        "from-orange-600 to-red-700",
        "from-cyan-600 to-blue-700",
        "from-green-600 to-emerald-700",
        "from-slate-600 to-gray-700",
      ]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const newField: Field = {
        id: Date.now().toString(),
        name: newFieldName.trim(),
        color: randomColor,
        subFields: [],
      }
      setFields([...fields, newField])
      setNewFieldName("")
    }
  }

  const addSubField = () => {
    if (newSubFieldName.trim() && selectedFieldForSubField) {
      const newSubField: SubField = {
        id: `${selectedFieldForSubField}-${Date.now()}`,
        name: newSubFieldName.trim(),
        parentId: selectedFieldForSubField,
      }

      setFields(
        fields.map((field) =>
          field.id === selectedFieldForSubField ? { ...field, subFields: [...field.subFields, newSubField] } : field,
        ),
      )
      setNewSubFieldName("")
      setSelectedFieldForSubField("")
    }
  }

  const deleteField = (fieldId: string) => {
    setFields(fields.filter((field) => field.id !== fieldId))
    setPapers(papers.map((paper) => (paper.fieldId === fieldId ? { ...paper, fieldId: "", subFieldId: "" } : paper)))
  }

  const deleteSubField = (fieldId: string, subFieldId: string) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, subFields: field.subFields.filter((sf) => sf.id !== subFieldId) } : field,
      ),
    )
    setPapers(papers.map((paper) => (paper.subFieldId === subFieldId ? { ...paper, subFieldId: "" } : paper)))
  }

  const toggleFieldExpansion = (fieldId: string) => {
    setExpandedFields((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const getFieldById = (fieldId: string) => {
    return fields.find((field) => field.id === fieldId)
  }

  const getSubFieldById = (subFieldId: string) => {
    for (const field of fields) {
      const subField = field.subFields.find((sf) => sf.id === subFieldId)
      if (subField) return subField
    }
    return null
  }

  // File upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        setNewPaper({ ...newPaper, file })
      }
    },
    [newPaper],
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewPaper({ ...newPaper, file })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Search functionality
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) return { papers, schedules, notes }

    const query = searchQuery.toLowerCase()

    const filteredPapers = papers.filter(
      (paper) =>
        paper.title.toLowerCase().includes(query) ||
        paper.summary.toLowerCase().includes(query) ||
        paper.authors.toLowerCase().includes(query) ||
        paper.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        getFieldById(paper.fieldId)?.name.toLowerCase().includes(query) ||
        getSubFieldById(paper.subFieldId || "")
          ?.name.toLowerCase()
          .includes(query),
    )

    const filteredSchedules = schedules.filter(
      (schedule) => schedule.title.toLowerCase().includes(query) || schedule.description.toLowerCase().includes(query),
    )

    const filteredNotes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
    )

    return {
      papers: filteredPapers,
      schedules: filteredSchedules,
      notes: filteredNotes,
    }
  }, [papers, schedules, notes, searchQuery, fields])

  // 검색 처리
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowSearchResults(true)
    }
  }

  // Calendar schedules
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      if (!schedule.dueDate) return false
      const scheduleDate = new Date(schedule.dueDate)
      return scheduleDate.toDateString() === date.toDateString()
    })
  }

  // Statistics calculation
  const getPersonalStats = (person: "sungkwon" | "jimin") => {
    const personalPapers = papers.filter((p) => p.personalStatus[person] !== "todo")
    const personalSchedules = schedules.filter((s) => s.assignee === person || s.assignee === "both")
    const personalNotes = notes.filter((n) => n.author === person)
    const completedSchedules = personalSchedules.filter((s) => s.completed).length
    const totalSchedules = personalSchedules.length
    const progressPercentage = totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0

    return {
      papers: personalPapers.length,
      completedSchedules,
      totalSchedules,
      notes: personalNotes.length,
      progressPercentage,
    }
  }

  const sungkwonStats = getPersonalStats("sungkwon")
  const jiminStats = getPersonalStats("jimin")

  const addPaper = () => {
    if (newPaper.title && newPaper.summary) {
      const paper: Paper = {
        id: Date.now().toString(),
        title: newPaper.title,
        authors: newPaper.authors,
        year: newPaper.year ? Number.parseInt(newPaper.year) : undefined,
        summary: newPaper.summary,
        tags: newPaper.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        fieldId: newPaper.fieldId,
        subFieldId: newPaper.subFieldId,
        date: new Date().toISOString().split("T")[0],
        uploadedBy: "sungkwon",
        file: newPaper.file
          ? {
              name: newPaper.file.name,
              size: newPaper.file.size,
              url: URL.createObjectURL(newPaper.file),
            }
          : undefined,
        personalStatus: {
          sungkwon: "todo",
          jimin: "todo",
        },
      }
      setPapers([...papers, paper])
      setNewPaper({ title: "", authors: "", year: "", summary: "", tags: "", fieldId: "", subFieldId: "", file: null })
    }
  }

  // 논문 편집 함수들
  const startEditingPaper = (paperId: string) => {
    setEditingPaper(paperId)
  }

  const saveEditingPaper = (paperId: string, updatedPaper: Partial<Paper>) => {
    setPapers(
      papers.map((paper) =>
        paper.id === paperId
          ? {
              ...paper,
              ...updatedPaper,
              tags:
                typeof updatedPaper.tags === "string"
                  ? updatedPaper.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag)
                  : updatedPaper.tags || paper.tags,
            }
          : paper,
      ),
    )
    setEditingPaper(null)
  }

  const cancelEditingPaper = () => {
    setEditingPaper(null)
  }

  const updatePaperStatus = (
    paperId: string,
    person: "sungkwon" | "jimin",
    status: "reading" | "completed" | "todo",
  ) => {
    setPapers(
      papers.map((paper) =>
        paper.id === paperId ? { ...paper, personalStatus: { ...paper.personalStatus, [person]: status } } : paper,
      ),
    )
  }

  const addSchedule = () => {
    if (newSchedule.title && newSchedule.description) {
      const schedule: Schedule = {
        id: Date.now().toString(),
        title: newSchedule.title,
        description: newSchedule.description,
        assignee: newSchedule.assignee,
        priority: newSchedule.priority,
        completed: false,
        dueDate: newSchedule.dueDate,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
      }
      setSchedules([...schedules, schedule])
      setNewSchedule({
        title: "",
        description: "",
        assignee: "sungkwon",
        priority: "medium",
        dueDate: "",
        startTime: "",
        endTime: "",
      })
    }
  }

  // 할일 편집 함수들
  const startEditingSchedule = (scheduleId: string) => {
    setEditingSchedule(scheduleId)
  }

  const saveEditingSchedule = (scheduleId: string, updatedSchedule: Partial<Schedule>) => {
    setSchedules(
      schedules.map((schedule) => (schedule.id === scheduleId ? { ...schedule, ...updatedSchedule } : schedule)),
    )
    setEditingSchedule(null)
  }

  const cancelEditingSchedule = () => {
    setEditingSchedule(null)
  }

  const addNote = () => {
    if (newNote.title && newNote.content) {
      const noteFiles: NoteFile[] = newNote.files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }))

      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        author: newNote.author,
        date: new Date().toISOString().split("T")[0],
        tags: newNote.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        files: noteFiles,
      }
      setNotes([...notes, note])
      setNewNote({ title: "", content: "", tags: "", author: "sungkwon", files: [] })
    }
  }

  // 노트 편집 함수들
  const startEditingNote = (noteId: string) => {
    setEditingNote(noteId)
  }

  const saveEditingNote = (noteId: string, updatedNote: Partial<Note>) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              ...updatedNote,
              tags:
                typeof updatedNote.tags === "string"
                  ? updatedNote.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter((tag) => tag)
                  : updatedNote.tags || note.tags,
            }
          : note,
      ),
    )
    setEditingNote(null)
  }

  const cancelEditingNote = () => {
    setEditingNote(null)
  }

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, completed: !schedule.completed } : schedule,
      ),
    )
  }

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/25"
      case "medium":
        return "bg-gradient-to-r from-amber-600 to-yellow-700 text-white shadow-lg shadow-amber-600/25"
      case "low":
        return "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/25"
      default:
        return "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-600/25"
    }
  }

  const getAssigneeColor = (assignee: string) => {
    switch (assignee) {
      case "sungkwon":
        return "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25"
      case "jimin":
        return "bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-lg shadow-rose-600/25"
      case "both":
        return "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-600/25"
      default:
        return "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-600/25"
    }
  }

  const getPersonName = (person: string) => {
    return person === "sungkwon" ? "성권" : person === "jimin" ? "지민" : "둘 다"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/25"
      case "reading":
        return "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25"
      case "todo":
        return "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-600/25"
      default:
        return "bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-600/25"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "완료"
      case "reading":
        return "읽는 중"
      case "todo":
        return "예정"
      default:
        return "예정"
    }
  }

  // 검색 결과 페이지 렌더링
  if (showSearchResults) {
    return (
      <div className="min-h-screen relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full blur-3xl animate-gentle-float"></div>
          <div
            className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-2xl animate-gentle-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
          {/* 검색 결과 헤더 */}
          <div className="mb-12">
            <Button
              variant="outline"
              onClick={() => setShowSearchResults(false)}
              className="mb-6 flex items-center gap-3 font-serif font-semibold text-lg h-12 px-6"
            >
              <ArrowLeft className="h-5 w-5" />
              메인으로 돌아가기
            </Button>

            <div className="text-center">
              <h1 className="text-5xl font-serif font-bold text-gray-800 mb-4">"{searchQuery}" 검색 결과</h1>
              <p className="text-xl font-body text-gray-600">
                총 {filteredContent.papers.length + filteredContent.schedules.length + filteredContent.notes.length}개의
                결과를 찾았습니다
              </p>
            </div>
          </div>

          {/* 검색 결과 탭 */}
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl luxury-card">
              <TabsTrigger
                value="all"
                className="flex items-center gap-3 text-lg font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                전체 ({filteredContent.papers.length + filteredContent.schedules.length + filteredContent.notes.length})
              </TabsTrigger>
              <TabsTrigger
                value="papers"
                className="flex items-center gap-3 text-lg font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <FileText className="h-5 w-5" />
                논문 ({filteredContent.papers.length})
              </TabsTrigger>
              <TabsTrigger
                value="schedules"
                className="flex items-center gap-3 text-lg font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <CalendarIcon className="h-5 w-5" />
                할일 ({filteredContent.schedules.length})
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex items-center gap-3 text-lg font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <Lightbulb className="h-5 w-5" />
                노트 ({filteredContent.notes.length})
              </TabsTrigger>
            </TabsList>

            {/* 전체 결과 */}
            <TabsContent value="all" className="space-y-8">
              {/* 논문 결과 */}
              {filteredContent.papers.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                    <FileText className="h-8 w-8" />
                    논문 ({filteredContent.papers.length}개)
                  </h2>
                  <div className="grid gap-6">
                    {filteredContent.papers.map((paper) => (
                      <Card
                        key={paper.id}
                        className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                        onClick={() => startEditingPaper(paper.id)}
                      >
                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-serif font-bold text-gray-800">{paper.title}</h3>
                            <div className="flex gap-2">
                              {paper.fieldId && (
                                <Badge
                                  className={`bg-gradient-to-r ${getFieldById(paper.fieldId)?.color} text-white shadow-lg font-serif font-semibold`}
                                >
                                  {getFieldById(paper.fieldId)?.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 font-body">
                            {paper.authors} • {paper.year} • {paper.date}
                          </p>
                          <p className="text-gray-700 leading-relaxed font-body">
                            {paper.summary.substring(0, 200)}...
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 할일 결과 */}
              {filteredContent.schedules.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8" />
                    할일 ({filteredContent.schedules.length}개)
                  </h2>
                  <div className="grid gap-6">
                    {filteredContent.schedules.map((schedule) => (
                      <Card
                        key={schedule.id}
                        className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                        onClick={() => startEditingSchedule(schedule.id)}
                      >
                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3
                              className={`text-2xl font-serif font-bold ${schedule.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                            >
                              {schedule.title}
                            </h3>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(schedule.priority)}>
                                {schedule.priority === "high"
                                  ? "높음"
                                  : schedule.priority === "medium"
                                    ? "보통"
                                    : "낮음"}
                              </Badge>
                              <Badge className={getAssigneeColor(schedule.assignee)}>
                                {getPersonName(schedule.assignee)}
                              </Badge>
                            </div>
                          </div>
                          <p
                            className={`text-gray-700 leading-relaxed font-body ${schedule.completed ? "line-through" : ""}`}
                          >
                            {schedule.description}
                          </p>
                          {schedule.dueDate && (
                            <p className="text-gray-500 mt-2 font-body">마감일: {schedule.dueDate}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 노트 결과 */}
              {filteredContent.notes.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                    <Lightbulb className="h-8 w-8" />
                    아이디어 노트 ({filteredContent.notes.length}개)
                  </h2>
                  <div className="grid gap-6">
                    {filteredContent.notes.map((note) => (
                      <Card
                        key={note.id}
                        className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                        onClick={() => startEditingNote(note.id)}
                      >
                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-serif font-bold text-gray-800">{note.title}</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-500 font-body">{getPersonName(note.author)}</span>
                              <span className="text-gray-500 font-body">{note.date}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed font-body">{note.content.substring(0, 200)}...</p>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {note.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-amber-50 border-amber-200 text-amber-800"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 검색 결과 없음 */}
              {filteredContent.papers.length === 0 &&
                filteredContent.schedules.length === 0 &&
                filteredContent.notes.length === 0 && (
                  <div className="text-center py-20">
                    <Search className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-serif font-bold text-gray-600 mb-4">검색 결과가 없습니다</h3>
                    <p className="text-lg text-gray-500 font-body">다른 키워드로 검색해보세요</p>
                  </div>
                )}
            </TabsContent>

            {/* 개별 탭 내용들 */}
            <TabsContent value="papers" className="space-y-6">
              {filteredContent.papers.length > 0 ? (
                <div className="grid gap-6">
                  {filteredContent.papers.map((paper) => (
                    <Card
                      key={paper.id}
                      className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                      onClick={() => startEditingPaper(paper.id)}
                    >
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-serif font-bold text-gray-800">{paper.title}</h3>
                          <div className="flex gap-2">
                            {paper.fieldId && (
                              <Badge
                                className={`bg-gradient-to-r ${getFieldById(paper.fieldId)?.color} text-white shadow-lg font-serif font-semibold`}
                              >
                                {getFieldById(paper.fieldId)?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 font-body">
                          {paper.authors} • {paper.year} • {paper.date}
                        </p>
                        <p className="text-gray-700 leading-relaxed font-body">{paper.summary}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {paper.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-bold text-gray-600 mb-4">논문 검색 결과가 없습니다</h3>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedules" className="space-y-6">
              {filteredContent.schedules.length > 0 ? (
                <div className="grid gap-6">
                  {filteredContent.schedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                      onClick={() => startEditingSchedule(schedule.id)}
                    >
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3
                            className={`text-2xl font-serif font-bold ${schedule.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                          >
                            {schedule.title}
                          </h3>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(schedule.priority)}>
                              {schedule.priority === "high" ? "높음" : schedule.priority === "medium" ? "보통" : "낮음"}
                            </Badge>
                            <Badge className={getAssigneeColor(schedule.assignee)}>
                              {getPersonName(schedule.assignee)}
                            </Badge>
                          </div>
                        </div>
                        <p
                          className={`text-gray-700 leading-relaxed font-body ${schedule.completed ? "line-through" : ""}`}
                        >
                          {schedule.description}
                        </p>
                        {schedule.dueDate && <p className="text-gray-500 mt-2 font-body">마감일: {schedule.dueDate}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <CalendarIcon className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-bold text-gray-600 mb-4">할일 검색 결과가 없습니다</h3>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              {filteredContent.notes.length > 0 ? (
                <div className="grid gap-6">
                  {filteredContent.notes.map((note) => (
                    <Card
                      key={note.id}
                      className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] cursor-pointer"
                      onClick={() => startEditingNote(note.id)}
                    >
                      <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-serif font-bold text-gray-800">{note.title}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-body">{getPersonName(note.author)}</span>
                            <span className="text-gray-500 font-body">{note.date}</span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-body">{note.content}</p>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {note.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-amber-50 border-amber-200 text-amber-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Lightbulb className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif font-bold text-gray-600 mb-4">노트 검색 결과가 없습니다</h3>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Luxury background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-300/20 rounded-full blur-3xl animate-gentle-float"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-full blur-2xl animate-gentle-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl animate-gentle-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl relative z-10">
        {/* Elegant Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full mb-10 shadow-2xl shadow-amber-600/25 animate-gentle-float">
            <Crown className="h-14 w-14 text-white" />
          </div>
          <h1 className="text-7xl font-serif font-bold text-gray-800 mb-6 tracking-tight leading-tight">
            Republic of Sungji
          </h1>
          <p className="text-2xl font-body text-gray-600 font-medium tracking-wide">함께 성장하는 연구 파트너십</p>
          <div className="mt-10 flex justify-center">
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
          </div>
        </div>

        {/* Elegant Search Bar */}
        <Card className="mb-16 luxury-card border-0 rounded-2xl animate-fade-in-up">
          <CardContent className="p-10">
            <div className="relative">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input
                placeholder="논문, 할일, 아이디어 노트에서 검색하세요... (엔터를 눌러 검색)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="pl-20 h-18 text-xl border-0 bg-gray-50/50 focus:bg-white transition-all duration-300 rounded-xl font-body"
              />
            </div>
            {searchQuery && !showSearchResults && (
              <div className="mt-6 text-lg text-gray-600 font-body">
                검색 결과: 논문 {filteredContent.papers.length}개, 할일 {filteredContent.schedules.length}개, 아이디어
                노트 {filteredContent.notes.length}개 (엔터를 눌러 상세 검색)
              </div>
            )}
          </CardContent>
        </Card>

        {/* Luxury Personal Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Sungkwon's Progress */}
          <Card className="luxury-card border-0 rounded-2xl animate-fade-in-up">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-8">
                <div className="profile-upload">
                  <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-600/25 border-4 border-white">
                    {userProfiles.sungkwon.avatar ? (
                      <AvatarImage src={userProfiles.sungkwon.avatar || "/placeholder.svg"} alt="성권" />
                    ) : (
                      <AvatarFallback className="text-white font-bold text-2xl font-serif">성권</AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleProfileImageUpload("sungkwon", e.target.files[0])
                      }
                    }}
                  />
                  <div className="profile-upload-overlay">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-3xl text-gray-800 font-serif font-bold">성권의 진행현황</CardTitle>
                  <CardDescription className="text-xl text-gray-600 font-body">개인 학습 통계</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <span className="text-4xl font-bold text-blue-600 font-serif">{sungkwonStats.papers}</span>
                  </div>
                  <div className="text-base text-gray-600 font-body">논문</div>
                </div>
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <CheckSquare className="h-8 w-8 text-emerald-600 mr-3" />
                    <span className="text-4xl font-bold text-emerald-600 font-serif">
                      {sungkwonStats.completedSchedules}/{sungkwonStats.totalSchedules}
                    </span>
                  </div>
                  <div className="text-base text-gray-600 font-body">할일</div>
                </div>
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <Lightbulb className="h-8 w-8 text-amber-600 mr-3" />
                    <span className="text-4xl font-bold text-amber-600 font-serif">{sungkwonStats.notes}</span>
                  </div>
                  <div className="text-base text-gray-600 font-body">아이디어</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-lg text-gray-600 font-body">
                  <span>완료율</span>
                  <span className="font-semibold">{Math.round(sungkwonStats.progressPercentage)}%</span>
                </div>
                <Progress value={sungkwonStats.progressPercentage} className="h-4 bg-white/80 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Jimin's Progress */}
          <Card className="luxury-card border-0 rounded-2xl animate-fade-in-up">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-8">
                <div className="profile-upload">
                  <Avatar className="h-24 w-24 bg-gradient-to-br from-rose-600 to-pink-700 shadow-2xl shadow-rose-600/25 border-4 border-white">
                    {userProfiles.jimin.avatar ? (
                      <AvatarImage src={userProfiles.jimin.avatar || "/placeholder.svg"} alt="지민" />
                    ) : (
                      <AvatarFallback className="text-white font-bold text-2xl font-serif">지민</AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleProfileImageUpload("jimin", e.target.files[0])
                      }
                    }}
                  />
                  <div className="profile-upload-overlay">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-3xl text-gray-800 font-serif font-bold">지민의 진행현황</CardTitle>
                  <CardDescription className="text-xl text-gray-600 font-body">개인 학습 통계</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <span className="text-4xl font-bold text-blue-600 font-serif">{jiminStats.papers}</span>
                  </div>
                  <div className="text-base text-gray-600 font-body">논문</div>
                </div>
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <CheckSquare className="h-8 w-8 text-emerald-600 mr-3" />
                    <span className="text-4xl font-bold text-emerald-600 font-serif">
                      {jiminStats.completedSchedules}/{jiminStats.totalSchedules}
                    </span>
                  </div>
                  <div className="text-base text-gray-600 font-body">할일</div>
                </div>
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center justify-center mb-4">
                    <Lightbulb className="h-8 w-8 text-amber-600 mr-3" />
                    <span className="text-4xl font-bold text-amber-600 font-serif">{jiminStats.notes}</span>
                  </div>
                  <div className="text-base text-gray-600 font-body">아이디어</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-lg text-gray-600 font-body">
                  <span>완료율</span>
                  <span className="font-semibold">{Math.round(jiminStats.progressPercentage)}%</span>
                </div>
                <Progress value={jiminStats.progressPercentage} className="h-4 bg-white/80 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elegant Main Content */}
        <Tabs defaultValue="papers" className="space-y-12">
          <TabsList className="grid w-full grid-cols-4 h-20 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl luxury-card">
            <TabsTrigger
              value="papers"
              className="flex items-center gap-4 text-xl font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <FileText className="h-7 w-7" />
              논문 정리
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="flex items-center gap-4 text-xl font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Target className="h-7 w-7" />
              프로젝트
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="flex items-center gap-4 text-xl font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <CalendarIcon className="h-7 w-7" />
              할일 관리
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="flex items-center gap-4 text-xl font-serif font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-700 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Lightbulb className="h-7 w-7" />
              아이디어 노트
            </TabsTrigger>
          </TabsList>

          {/* Papers Tab */}
          <TabsContent value="papers" className="space-y-12">
            {/* Field Manager with Sub-fields */}
            <Card className="luxury-card border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-amber-600/10 to-yellow-700/10 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-3xl font-serif font-bold flex items-center gap-4">
                      <BookOpen className="h-8 w-8" />
                      연구 분야 관리
                    </CardTitle>
                    <CardDescription className="text-xl font-body">
                      논문을 분야별로 체계적으로 분류해보세요
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFieldManager(!showFieldManager)}
                    className="flex items-center gap-3 font-body text-lg h-12 px-6"
                  >
                    <Settings className="h-5 w-5" />
                    {showFieldManager ? "닫기" : "분야 관리"}
                  </Button>
                </div>
              </CardHeader>
              {showFieldManager && (
                <CardContent className="p-10 space-y-10">
                  {/* Add new field */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold text-gray-800">새 분야 추가</h3>
                    <div className="flex gap-4">
                      <Input
                        placeholder="새 분야명을 입력하세요"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="h-14 font-body text-lg"
                        onKeyPress={(e) => e.key === "Enter" && addField()}
                      />
                      <Button
                        onClick={addField}
                        className="h-14 px-8 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-serif font-semibold shadow-lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        추가
                      </Button>
                    </div>
                  </div>

                  {/* Add sub-field */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold text-gray-800">하위 분야 추가</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={selectedFieldForSubField}
                        onChange={(e) => setSelectedFieldForSubField(e.target.value)}
                        className="h-14 p-4 border border-gray-300 rounded-xl bg-white font-body text-lg"
                      >
                        <option value="">상위 분야 선택</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="하위 분야명 입력"
                        value={newSubFieldName}
                        onChange={(e) => setNewSubFieldName(e.target.value)}
                        className="h-14 font-body text-lg"
                        onKeyPress={(e) => e.key === "Enter" && addSubField()}
                      />
                      <Button
                        onClick={addSubField}
                        disabled={!selectedFieldForSubField || !newSubFieldName.trim()}
                        className="h-14 px-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-semibold shadow-lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        하위분야 추가
                      </Button>
                    </div>
                  </div>

                  {/* Field list with sub-fields */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif font-bold text-gray-800">분야 목록</h3>
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                          <div
                            className={`p-6 bg-gradient-to-r ${field.color} text-white flex justify-between items-center cursor-pointer`}
                            onClick={() => toggleFieldExpansion(field.id)}
                          >
                            <div className="flex items-center gap-3">
                              {expandedFields.includes(field.id) ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <span className="font-serif font-bold text-xl">{field.name}</span>
                              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {field.subFields.length}개 하위분야
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteField(field.id)
                              }}
                              className="text-white hover:bg-white/20 h-10 w-10 p-0"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                          {expandedFields.includes(field.id) && (
                            <div className="p-6 bg-gray-50 space-y-3">
                              {field.subFields.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {field.subFields.map((subField) => (
                                    <div
                                      key={subField.id}
                                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200"
                                    >
                                      <span className="font-body text-gray-700">{subField.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteSubField(field.id, subField.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 font-body text-center py-4">하위 분야가 없습니다.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card className="luxury-card border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-700/10 rounded-t-2xl">
                <CardTitle className="text-4xl font-serif font-bold flex items-center gap-4">
                  <FileText className="h-10 w-10 text-blue-600" />새 논문 추가
                </CardTitle>
                <CardDescription className="text-xl font-body">새로운 논문을 추가하고 정리해보세요</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                {/* File Upload Area */}
                <div>
                  <Label className="text-xl font-serif font-semibold mb-4 block">논문 파일 업로드 (선택사항)</Label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      dragActive ? "border-amber-500 bg-amber-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {newPaper.file ? (
                      <div className="flex items-center justify-center gap-6">
                        <File className="h-12 w-12 text-amber-600" />
                        <div className="text-left">
                          <div className="font-serif font-semibold text-xl">{newPaper.file.name}</div>
                          <div className="text-lg text-gray-500 font-body">{formatFileSize(newPaper.file.size)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewPaper({ ...newPaper, file: null })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-8">
                          <Upload className="h-16 w-16 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-4 text-xl font-body">논문 파일을 드래그하여 업로드하거나</p>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-amber-600 hover:text-amber-700 font-serif font-semibold text-xl">
                            파일 선택
                          </span>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-lg text-gray-500 mt-4 font-body">PDF, DOC, DOCX, TXT 파일 지원</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <Label htmlFor="paper-title" className="text-xl font-serif font-semibold">
                      논문 제목
                    </Label>
                    <Input
                      id="paper-title"
                      value={newPaper.title}
                      onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                      placeholder="논문 제목을 입력하세요"
                      className="h-16 mt-4 text-lg font-body rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paper-authors" className="text-xl font-serif font-semibold">
                      저자
                    </Label>
                    <Input
                      id="paper-authors"
                      value={newPaper.authors}
                      onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
                      placeholder="저자명을 입력하세요"
                      className="h-16 mt-4 text-lg font-body rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="paper-year" className="text-xl font-serif font-semibold">
                    발표 연도
                  </Label>
                  <Input
                    id="paper-year"
                    type="number"
                    value={newPaper.year}
                    onChange={(e) => setNewPaper({ ...newPaper, year: e.target.value })}
                    placeholder="예: 2024"
                    className="h-16 mt-4 text-lg font-body rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="paper-summary" className="text-xl font-serif font-semibold">
                    요약
                  </Label>
                  <Textarea
                    id="paper-summary"
                    value={newPaper.summary}
                    onChange={(e) => setNewPaper({ ...newPaper, summary: e.target.value })}
                    placeholder="논문의 핵심 내용을 요약해주세요"
                    rows={6}
                    className="mt-4 text-lg font-body rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div>
                    <Label htmlFor="paper-field" className="text-xl font-serif font-semibold">
                      연구 분야
                    </Label>
                    <select
                      id="paper-field"
                      value={newPaper.fieldId}
                      onChange={(e) => {
                        setNewPaper({ ...newPaper, fieldId: e.target.value, subFieldId: "" })
                      }}
                      className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body"
                    >
                      <option value="">분야를 선택하세요</option>
                      {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                          {field.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paper-subfield" className="text-xl font-serif font-semibold">
                      하위 분야
                    </Label>
                    <select
                      id="paper-subfield"
                      value={newPaper.subFieldId}
                      onChange={(e) => setNewPaper({ ...newPaper, subFieldId: e.target.value })}
                      disabled={!newPaper.fieldId}
                      className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body disabled:bg-gray-100"
                    >
                      <option value="">하위 분야 선택 (선택사항)</option>
                      {newPaper.fieldId &&
                        fields
                          .find((f) => f.id === newPaper.fieldId)
                          ?.subFields.map((subField) => (
                            <option key={subField.id} value={subField.id}>
                              {subField.name}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paper-tags" className="text-xl font-serif font-semibold">
                      태그 (쉼표로 구분)
                    </Label>
                    <Input
                      id="paper-tags"
                      value={newPaper.tags}
                      onChange={(e) => setNewPaper({ ...newPaper, tags: e.target.value })}
                      placeholder="예: 딥러닝, NLP, 컴퓨터비전"
                      className="h-16 mt-4 text-lg font-body rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  onClick={addPaper}
                  className="w-full h-18 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-serif font-bold text-xl shadow-2xl rounded-2xl"
                >
                  <Plus className="h-7 w-7 mr-4" />
                  논문 추가
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-10">
              {papers.map((paper) => (
                <Card
                  key={paper.id}
                  className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01]"
                >
                  <CardHeader className="pb-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {editingPaper === paper.id ? (
                          <EditPaperForm
                            paper={paper}
                            fields={fields}
                            onSave={(updatedPaper) => saveEditingPaper(paper.id, updatedPaper)}
                            onCancel={cancelEditingPaper}
                          />
                        ) : (
                          <>
                            <CardTitle
                              className="text-3xl mb-4 font-serif font-bold text-gray-800 cursor-pointer hover:text-amber-600 transition-colors"
                              onClick={() => startEditingPaper(paper.id)}
                            >
                              {paper.title}
                              <Edit className="inline h-6 w-6 ml-3 opacity-50 hover:opacity-100" />
                            </CardTitle>
                            <CardDescription className="text-xl font-body">
                              {paper.authors} {paper.year && `• ${paper.year}`} • {paper.date} • 업로드:{" "}
                              {getPersonName(paper.uploadedBy)}
                            </CardDescription>
                          </>
                        )}
                      </div>
                      {editingPaper !== paper.id && (
                        <div className="flex gap-4 flex-wrap">
                          {paper.fieldId && (
                            <Badge
                              className={`bg-gradient-to-r ${getFieldById(paper.fieldId)?.color} text-white shadow-lg font-serif font-semibold text-base py-2 px-4`}
                            >
                              {getFieldById(paper.fieldId)?.name}
                            </Badge>
                          )}
                          {paper.subFieldId && (
                            <Badge variant="outline" className="bg-white border-gray-300 font-body text-base py-2 px-4">
                              {getSubFieldById(paper.subFieldId)?.name}
                            </Badge>
                          )}
                          <Badge className={getAssigneeColor(paper.uploadedBy)}>
                            {getPersonName(paper.uploadedBy)} 업로드
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {editingPaper !== paper.id && (
                    <CardContent>
                      <p className="text-gray-700 mb-8 leading-relaxed text-xl font-body">{paper.summary}</p>

                      {/* File attachment */}
                      {paper.file && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <File className="h-8 w-8 text-amber-600" />
                            <div>
                              <div className="font-serif font-semibold text-lg">{paper.file.name}</div>
                              <div className="text-base text-gray-500 font-body">{formatFileSize(paper.file.size)}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                            <Download className="h-6 w-6" />
                          </Button>
                        </div>
                      )}

                      {/* Personal status controls */}
                      <div className="mb-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-serif font-semibold text-gray-700">성권의 상태:</span>
                          <div className="flex gap-4">
                            {["todo", "reading", "completed"].map((status) => (
                              <Button
                                key={status}
                                variant={paper.personalStatus.sungkwon === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => updatePaperStatus(paper.id, "sungkwon", status as any)}
                                className={`font-serif font-semibold ${paper.personalStatus.sungkwon === status ? getStatusColor(status) : ""}`}
                              >
                                {getStatusText(status)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-serif font-semibold text-gray-700">지민의 상태:</span>
                          <div className="flex gap-4">
                            {["todo", "reading", "completed"].map((status) => (
                              <Button
                                key={status}
                                variant={paper.personalStatus.jimin === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => updatePaperStatus(paper.id, "jimin", status as any)}
                                className={`font-serif font-semibold ${paper.personalStatus.jimin === status ? getStatusColor(status) : ""}`}
                              >
                                {getStatusText(status)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {paper.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-50 hover:bg-gray-100 font-body text-lg py-2 px-4"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-12">
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
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-12">
            {/* Calendar Toggle */}
            <div className="flex justify-end mb-8">
              <Button
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-4 h-14 px-8 font-serif font-semibold text-lg shadow-lg"
              >
                <CalendarIcon className="h-6 w-6" />
                {showCalendar ? "목록 보기" : "캘린더 보기"}
              </Button>
            </div>

            {showCalendar ? (
              /* Calendar View */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <Card className="lg:col-span-1 luxury-card border-0 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif font-bold">할일 캘린더</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={calendarDate}
                      onSelect={setCalendarDate}
                      className="rounded-2xl border-0 shadow-lg"
                      modifiers={{
                        hasSchedule: (date) => getSchedulesForDate(date).length > 0,
                      }}
                      modifiersStyles={{
                        hasSchedule: {
                          backgroundColor: "#d97706",
                          color: "white",
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 luxury-card border-0 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-3xl font-serif font-bold">
                      {calendarDate
                        ? `${calendarDate.getMonth() + 1}월 ${calendarDate.getDate()}일 할일`
                        : "날짜를 선택하세요"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {calendarDate ? (
                      <div className="space-y-8">
                        {getSchedulesForDate(calendarDate).map((schedule) => (
                          <Card key={schedule.id} className="border border-gray-200 shadow-lg rounded-2xl">
                            <CardContent className="p-8">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-6 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={schedule.completed}
                                    onChange={() => toggleSchedule(schedule.id)}
                                    className="mt-1 w-7 h-7 accent-amber-600"
                                  />
                                  <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => startEditingSchedule(schedule.id)}
                                  >
                                    <h3
                                      className={`font-serif font-bold text-2xl hover:text-amber-600 transition-colors ${schedule.completed ? "line-through text-gray-500" : ""}`}
                                    >
                                      {schedule.title}
                                      <Edit className="inline h-5 w-5 ml-2 opacity-50 hover:opacity-100" />
                                    </h3>
                                    <p
                                      className={`text-lg text-gray-600 mt-3 font-body ${schedule.completed ? "line-through" : ""}`}
                                    >
                                      {schedule.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-6">
                                      <Badge className={getPriorityColor(schedule.priority)}>
                                        {schedule.priority === "high"
                                          ? "높음"
                                          : schedule.priority === "medium"
                                            ? "보통"
                                            : "낮음"}
                                      </Badge>
                                      <Badge className={getAssigneeColor(schedule.assignee)}>
                                        {getPersonName(schedule.assignee)}
                                      </Badge>
                                      {schedule.startTime && schedule.endTime && (
                                        <Badge variant="outline" className="bg-gray-50 font-body text-base py-2 px-4">
                                          <Clock className="h-4 w-4 mr-2" />
                                          {schedule.startTime} - {schedule.endTime}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {getSchedulesForDate(calendarDate).length === 0 && (
                          <p className="text-gray-500 text-center py-16 text-xl font-body">
                            이 날짜에 할일이 없습니다.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-16 text-xl font-body">
                        캘린더에서 날짜를 선택해주세요.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* List View */
              <>
                <Card className="luxury-card border-0 rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-600/10 to-teal-700/10 rounded-t-2xl">
                    <CardTitle className="text-4xl font-serif font-bold">새 할일 추가</CardTitle>
                    <CardDescription className="text-xl font-body">스터디 할일을 계획해보세요</CardDescription>
                  </CardHeader>
                  <CardContent className="p-12 space-y-10">
                    <div>
                      <Label htmlFor="schedule-title" className="text-xl font-serif font-semibold">
                        할일 제목
                      </Label>
                      <Input
                        id="schedule-title"
                        value={newSchedule.title}
                        onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                        placeholder="할일을 입력하세요"
                        className="h-16 mt-4 text-lg font-body rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-description" className="text-xl font-serif font-semibold">
                        설명
                      </Label>
                      <Textarea
                        id="schedule-description"
                        value={newSchedule.description}
                        onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                        placeholder="할일에 대한 자세한 설명을 입력하세요"
                        rows={5}
                        className="mt-4 text-lg font-body rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div>
                        <Label htmlFor="schedule-assignee" className="text-xl font-serif font-semibold">
                          담당자
                        </Label>
                        <select
                          id="schedule-assignee"
                          value={newSchedule.assignee}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              assignee: e.target.value as "sungkwon" | "jimin" | "both",
                            })
                          }
                          className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body"
                        >
                          <option value="sungkwon">성권</option>
                          <option value="jimin">지민</option>
                          <option value="both">둘 다</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="schedule-priority" className="text-xl font-serif font-semibold">
                          우선순위
                        </Label>
                        <select
                          id="schedule-priority"
                          value={newSchedule.priority}
                          onChange={(e) =>
                            setNewSchedule({ ...newSchedule, priority: e.target.value as "high" | "medium" | "low" })
                          }
                          className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body"
                        >
                          <option value="high">높음</option>
                          <option value="medium">보통</option>
                          <option value="low">낮음</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="schedule-due" className="text-xl font-serif font-semibold">
                          날짜
                        </Label>
                        <Input
                          id="schedule-due"
                          type="date"
                          value={newSchedule.dueDate}
                          onChange={(e) => setNewSchedule({ ...newSchedule, dueDate: e.target.value })}
                          className="h-16 mt-4 text-lg font-body rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <Label htmlFor="schedule-start" className="text-xl font-serif font-semibold">
                          시작 시간
                        </Label>
                        <Input
                          id="schedule-start"
                          type="time"
                          value={newSchedule.startTime}
                          onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                          className="h-16 mt-4 text-lg font-body rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="schedule-end" className="text-xl font-serif font-semibold">
                          종료 시간
                        </Label>
                        <Input
                          id="schedule-end"
                          type="time"
                          value={newSchedule.endTime}
                          onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                          className="h-16 mt-4 text-lg font-body rounded-xl"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={addSchedule}
                      className="w-full h-18 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-bold text-xl shadow-2xl rounded-2xl"
                    >
                      <Plus className="h-7 w-7 mr-4" />
                      할일 추가
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid gap-8">
                  {schedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className={`luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] ${schedule.completed ? "opacity-75" : ""}`}
                    >
                      <CardContent className="p-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-8 flex-1">
                            <input
                              type="checkbox"
                              checked={schedule.completed}
                              onChange={() => toggleSchedule(schedule.id)}
                              className="mt-1 w-7 h-7 accent-amber-600"
                            />
                            <div className="flex-1">
                              {editingSchedule === schedule.id ? (
                                <EditScheduleForm
                                  schedule={schedule}
                                  onSave={(updatedSchedule) => saveEditingSchedule(schedule.id, updatedSchedule)}
                                  onCancel={cancelEditingSchedule}
                                />
                              ) : (
                                <>
                                  <h3
                                    className={`font-serif font-bold text-3xl mb-4 cursor-pointer hover:text-amber-600 transition-colors ${schedule.completed ? "line-through text-gray-500" : ""}`}
                                    onClick={() => startEditingSchedule(schedule.id)}
                                  >
                                    {schedule.title}
                                    <Edit className="inline h-6 w-6 ml-3 opacity-50 hover:opacity-100" />
                                  </h3>
                                  <p
                                    className={`text-gray-600 mb-8 text-xl font-body ${schedule.completed ? "line-through" : ""}`}
                                  >
                                    {schedule.description}
                                  </p>
                                  <div className="flex items-center gap-6 flex-wrap">
                                    <Badge className={getPriorityColor(schedule.priority)}>
                                      <Target className="h-5 w-5 mr-2" />
                                      {schedule.priority === "high"
                                        ? "높음"
                                        : schedule.priority === "medium"
                                          ? "보통"
                                          : "낮음"}
                                    </Badge>
                                    <Badge className={getAssigneeColor(schedule.assignee)}>
                                      <Users className="h-5 w-5 mr-2" />
                                      {getPersonName(schedule.assignee)}
                                    </Badge>
                                    {schedule.dueDate && (
                                      <Badge variant="outline" className="bg-gray-50 font-body text-lg py-2 px-4">
                                        <CalendarIcon className="h-5 w-5 mr-2" />
                                        {schedule.dueDate}
                                      </Badge>
                                    )}
                                    {schedule.startTime && schedule.endTime && (
                                      <Badge variant="outline" className="bg-gray-50 font-body text-lg py-2 px-4">
                                        <Clock className="h-5 w-5 mr-2" />
                                        {schedule.startTime} - {schedule.endTime}
                                      </Badge>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          {editingSchedule !== schedule.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSchedule(schedule.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-6 w-6" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-12">
            <Card className="luxury-card border-0 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-amber-600/10 to-yellow-700/10 rounded-t-2xl">
                <CardTitle className="text-4xl font-serif font-bold flex items-center gap-4">
                  <Lightbulb className="h-10 w-10" />새 아이디어 노트 작성
                </CardTitle>
                <CardDescription className="text-xl font-body">연구 아이디어나 영감을 기록해보세요</CardDescription>
              </CardHeader>
              <CardContent className="p-12 space-y-10">
                <div>
                  <Label htmlFor="note-title" className="text-xl font-serif font-semibold">
                    아이디어 제목
                  </Label>
                  <Input
                    id="note-title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="아이디어 제목을 입력하세요"
                    className="h-16 mt-4 text-lg font-body rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="note-content" className="text-xl font-serif font-semibold">
                    내용
                  </Label>
                  <Textarea
                    id="note-content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="아이디어의 구체적인 내용을 입력하세요"
                    rows={10}
                    className="mt-4 text-lg font-body rounded-xl"
                  />
                </div>

                {/* 파일 업로드 섹션 */}
                <div>
                  <Label className="text-xl font-serif font-semibold mb-4 block">파일 첨부 (이미지, 문서 등)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-amber-400 transition-colors">
                    <div className="flex items-center justify-center mb-4">
                      <Paperclip className="h-12 w-12 text-gray-400 mr-4" />
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4 text-lg font-body">파일을 드래그하여 업로드하거나</p>
                    <label htmlFor="note-file-upload" className="cursor-pointer">
                      <span className="text-amber-600 hover:text-amber-700 font-serif font-semibold text-lg">
                        파일 선택
                      </span>
                      <input
                        id="note-file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleNoteFileUpload(e.target.files)
                          }
                        }}
                      />
                    </label>
                    <p className="text-base text-gray-500 mt-4 font-body">
                      이미지, PDF, DOC, PPT 등 다양한 파일 형식 지원
                    </p>
                  </div>

                  {/* 업로드된 파일 목록 */}
                  {newNote.files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="text-lg font-serif font-semibold text-gray-700">첨부된 파일:</h4>
                      <div className="grid gap-3">
                        {newNote.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border"
                          >
                            <div className="flex items-center gap-4">
                              {file.type.startsWith("image/") ? (
                                <ImageIcon className="h-6 w-6 text-blue-600" />
                              ) : (
                                <File className="h-6 w-6 text-gray-600" />
                              )}
                              <div>
                                <div className="font-serif font-semibold text-gray-800">{file.name}</div>
                                <div className="text-sm text-gray-500 font-body">{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNoteFile(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <Label htmlFor="note-tags" className="text-xl font-serif font-semibold">
                      태그 (쉼표로 구분)
                    </Label>
                    <Input
                      id="note-tags"
                      value={newNote.tags}
                      onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                      placeholder="예: 아이디어, 중요, 복습"
                      className="h-16 mt-4 text-lg font-body rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="note-author" className="text-xl font-serif font-semibold">
                      작성자
                    </Label>
                    <select
                      id="note-author"
                      value={newNote.author}
                      onChange={(e) => setNewNote({ ...newNote, author: e.target.value as "sungkwon" | "jimin" })}
                      className="w-full h-16 mt-4 p-4 border border-gray-300 rounded-xl bg-white text-lg font-body"
                    >
                      <option value="sungkwon">성권</option>
                      <option value="jimin">지민</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={addNote}
                  className="w-full h-18 bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-serif font-bold text-xl shadow-2xl rounded-2xl"
                >
                  <Plus className="h-7 w-7 mr-4" />
                  아이디어 노트 추가
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-10">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="luxury-card border-0 rounded-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01]"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      {editingNote === note.id ? (
                        <div className="w-full">
                          <EditNoteForm
                            note={note}
                            onSave={(updatedNote) => saveEditingNote(note.id, updatedNote)}
                            onCancel={cancelEditingNote}
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle
                            className="text-3xl font-serif font-bold flex items-center gap-4 cursor-pointer hover:text-amber-600 transition-colors"
                            onClick={() => startEditingNote(note.id)}
                          >
                            <Lightbulb className="h-8 w-8 text-amber-600" />
                            {note.title}
                            <Edit className="h-6 w-6 opacity-50 hover:opacity-100" />
                          </CardTitle>
                          <div className="flex items-center gap-6">
                            <div className="profile-upload">
                              <Avatar
                                className={`h-16 w-16 shadow-lg border-4 border-white ${note.author === "sungkwon" ? "bg-gradient-to-br from-blue-600 to-indigo-700" : "bg-gradient-to-br from-rose-600 to-pink-700"}`}
                              >
                                {userProfiles[note.author].avatar ? (
                                  <AvatarImage
                                    src={userProfiles[note.author].avatar || "/placeholder.svg"}
                                    alt={note.author}
                                  />
                                ) : (
                                  <AvatarFallback className="text-white font-bold text-xl font-serif">
                                    {note.author === "sungkwon" ? "성권" : "지민"}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="text-lg text-gray-500 font-body">{note.date}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  {editingNote !== note.id && (
                    <CardContent>
                      <p className="text-gray-700 mb-8 whitespace-pre-wrap leading-relaxed text-xl font-body">
                        {note.content}
                      </p>

                      {/* 첨부 파일 표시 */}
                      {note.files.length > 0 && (
                        <div className="mb-8 space-y-4">
                          <h4 className="text-lg font-serif font-semibold text-gray-700 flex items-center gap-2">
                            <Paperclip className="h-5 w-5" />
                            첨부 파일 ({note.files.length}개)
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {note.files.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.open(file.url, "_blank")}
                              >
                                {file.type.startsWith("image/") ? (
                                  <div className="relative">
                                    <img
                                      src={file.url || "/placeholder.svg"}
                                      alt={file.name}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <File className="h-8 w-8 text-blue-600" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-serif font-semibold text-gray-800 truncate">{file.name}</div>
                                  <div className="text-sm text-gray-500 font-body">{formatFileSize(file.size)}</div>
                                  <div className="text-xs text-gray-400 font-body capitalize">
                                    {file.type.split("/")[0]} 파일
                                  </div>
                                </div>
                                <Download className="h-5 w-5 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4">
                        {note.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 font-body text-lg py-2 px-4"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// 논문 편집 폼 컴포넌트
function EditPaperForm({
  paper,
  fields,
  onSave,
  onCancel,
}: {
  paper: Paper
  fields: Field[]
  onSave: (updatedPaper: Partial<Paper>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    title: paper.title,
    authors: paper.authors,
    year: paper.year?.toString() || "",
    summary: paper.summary,
    tags: paper.tags.join(", "),
    fieldId: paper.fieldId,
    subFieldId: paper.subFieldId || "",
  })

  const handleSave = () => {
    onSave({
      ...editData,
      year: editData.year ? Number.parseInt(editData.year) : undefined,
      tags: editData.tags,
    })
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-serif font-semibold">논문 제목</Label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">저자</Label>
          <Input
            value={editData.authors}
            onChange={(e) => setEditData({ ...editData, authors: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
      </div>

      <div>
        <Label className="text-lg font-serif font-semibold">발표 연도</Label>
        <Input
          type="number"
          value={editData.year}
          onChange={(e) => setEditData({ ...editData, year: e.target.value })}
          className="mt-2 h-12 text-lg font-body"
        />
      </div>

      <div>
        <Label className="text-lg font-serif font-semibold">요약</Label>
        <Textarea
          value={editData.summary}
          onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
          rows={4}
          className="mt-2 text-lg font-body"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-serif font-semibold">연구 분야</Label>
          <select
            value={editData.fieldId}
            onChange={(e) => setEditData({ ...editData, fieldId: e.target.value, subFieldId: "" })}
            className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-lg bg-white text-lg font-body"
          >
            <option value="">분야를 선택하세요</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">하위 분야</Label>
          <select
            value={editData.subFieldId}
            onChange={(e) => setEditData({ ...editData, subFieldId: e.target.value })}
            disabled={!editData.fieldId}
            className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-lg bg-white text-lg font-body disabled:bg-gray-100"
          >
            <option value="">하위 분야 선택 (선택사항)</option>
            {editData.fieldId &&
              fields
                .find((f) => f.id === editData.fieldId)
                ?.subFields.map((subField) => (
                  <option key={subField.id} value={subField.id}>
                    {subField.name}
                  </option>
                ))}
          </select>
        </div>
      </div>

      <div>
        <Label className="text-lg font-serif font-semibold">태그 (쉼표로 구분)</Label>
        <Input
          value={editData.tags}
          onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
          className="mt-2 h-12 text-lg font-body"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          저장
        </Button>
        <Button variant="outline" onClick={onCancel} className="font-serif font-semibold bg-transparent">
          취소
        </Button>
      </div>
    </div>
  )
}

// 할일 편집 폼 컴포넌트
function EditScheduleForm({
  schedule,
  onSave,
  onCancel,
}: {
  schedule: Schedule
  onSave: (updatedSchedule: Partial<Schedule>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    title: schedule.title,
    description: schedule.description,
    assignee: schedule.assignee,
    priority: schedule.priority,
    dueDate: schedule.dueDate,
    startTime: schedule.startTime || "",
    endTime: schedule.endTime || "",
  })

  return (
    <div className="space-y-6 w-full">
      <div>
        <Label className="text-lg font-serif font-semibold">할일 제목</Label>
        <Input
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="mt-2 h-12 text-lg font-body"
        />
      </div>

      <div>
        <Label className="text-lg font-serif font-semibold">설명</Label>
        <Textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          rows={3}
          className="mt-2 text-lg font-body"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label className="text-lg font-serif font-semibold">담당자</Label>
          <select
            value={editData.assignee}
            onChange={(e) => setEditData({ ...editData, assignee: e.target.value as "sungkwon" | "jimin" | "both" })}
            className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-lg bg-white text-lg font-body"
          >
            <option value="sungkwon">성권</option>
            <option value="jimin">지민</option>
            <option value="both">둘 다</option>
          </select>
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">우선순위</Label>
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value as "high" | "medium" | "low" })}
            className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-lg bg-white text-lg font-body"
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">날짜</Label>
          <Input
            type="date"
            value={editData.dueDate}
            onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-serif font-semibold">시작 시간</Label>
          <Input
            type="time"
            value={editData.startTime}
            onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">종료 시간</Label>
          <Input
            type="time"
            value={editData.endTime}
            onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={() => onSave(editData)}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          저장
        </Button>
        <Button variant="outline" onClick={onCancel} className="font-serif font-semibold bg-transparent">
          취소
        </Button>
      </div>
    </div>
  )
}

// 노트 편집 폼 컴포넌트
function EditNoteForm({
  note,
  onSave,
  onCancel,
}: {
  note: Note
  onSave: (updatedNote: Partial<Note>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    tags: note.tags.join(", "),
    author: note.author,
  })

  return (
    <div className="space-y-6 w-full">
      <div>
        <Label className="text-lg font-serif font-semibold">아이디어 제목</Label>
        <Input
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="mt-2 h-12 text-lg font-body"
        />
      </div>

      <div>
        <Label className="text-lg font-serif font-semibold">내용</Label>
        <Textarea
          value={editData.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          rows={8}
          className="mt-2 text-lg font-body"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-lg font-serif font-semibold">태그 (쉼표로 구분)</Label>
          <Input
            value={editData.tags}
            onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
            className="mt-2 h-12 text-lg font-body"
          />
        </div>
        <div>
          <Label className="text-lg font-serif font-semibold">작성자</Label>
          <select
            value={editData.author}
            onChange={(e) => setEditData({ ...editData, author: e.target.value as "sungkwon" | "jimin" })}
            className="w-full h-12 mt-2 p-3 border border-gray-300 rounded-lg bg-white text-lg font-body"
          >
            <option value="sungkwon">성권</option>
            <option value="jimin">지민</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          onClick={() => onSave({ ...editData, tags: editData.tags })}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-serif font-semibold"
        >
          <Save className="h-5 w-5 mr-2" />
          저장
        </Button>
        <Button variant="outline" onClick={onCancel} className="font-serif font-semibold bg-transparent">
          취소
        </Button>
      </div>
    </div>
  )
}
