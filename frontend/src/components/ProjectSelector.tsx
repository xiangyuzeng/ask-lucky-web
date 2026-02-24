import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, AlertCircle, Loader2 } from "lucide-react";
import type { ProjectsResponse, ProjectInfo } from "../types";
import { getProjectsUrl } from "../config/api";
import { useTranslation } from "../i18n";

export function ProjectSelector() {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(getProjectsUrl());
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data: ProjectsResponse = await response.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectPath: string) => {
    const normalizedPath = projectPath.startsWith("/")
      ? projectPath
      : `/${projectPath}`;
    navigate(`/projects${normalizedPath}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--luckin-bg)]">
        <div className="flex items-center gap-3 text-[var(--luckin-text-secondary)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t("projectSelector.loading")}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--luckin-bg)] gap-4">
        <div className="flex items-center gap-3 text-[var(--luckin-error)]">
          <AlertCircle className="w-5 h-5" />
          <span>{t("projectSelector.error", { error })}</span>
        </div>
        <button
          onClick={() => {
            setError(null);
            loadProjects();
          }}
          className="px-4 py-2 rounded-lg bg-[var(--luckin-primary)] text-white hover:bg-[var(--luckin-primary-hover)] transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--luckin-bg)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-[var(--luckin-text-primary)] text-3xl font-bold tracking-tight mb-8">
          {t("projectSelector.title")}
        </h1>

        <div className="space-y-3">
          {projects.length > 0 && (
            <>
              <h2 className="text-[var(--luckin-text-secondary)] text-lg font-medium mb-4">
                {t("projectSelector.recentProjects")}
              </h2>
              {projects.map((project, index) => (
                <button
                  key={project.path}
                  onClick={() => handleProjectSelect(project.path)}
                  className={`w-full flex items-center gap-3 p-4 glass-luckin hover-lift rounded-lg transition-all duration-200 text-left animate-fade-slide-up stagger-${Math.min(index + 1, 7)}`}
                >
                  <FolderOpen className="h-5 w-5 text-[var(--luckin-primary)] flex-shrink-0" />
                  <span className="text-[var(--luckin-text-primary)] font-mono text-sm">
                    {project.path}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
